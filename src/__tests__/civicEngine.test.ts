import {
  calculateHaversineDistanceMeters,
  calculateTextSimilarity,
  findLikelyDuplicates,
  computeExplainablePriority,
  detectGeographicClusters,
} from "../lib/civicEngine";
import { INITIAL_SYNTHETIC_REPORTS } from "../lib/syntheticReports";
import {
  CivicReportSchema,
  SubmitReportInputSchema,
  WorkflowUpdateInputSchema,
} from "../lib/validators";

describe("Civic Engine - Haversine Distance Calculation", () => {
  test("returns 0 meters for identical coordinates", () => {
    const dist = calculateHaversineDistanceMeters(12.97562, 77.60685, 12.97562, 77.60685);
    expect(dist).toBe(0);
  });

  test("accurately calculates short urban distances within ~20 meters", () => {
    // AST-101 and AST-102 coordinates (~12.97562, 77.60685 vs 12.97571, 77.60692)
    const dist = calculateHaversineDistanceMeters(12.97562, 77.60685, 12.97571, 77.60692);
    expect(dist).toBeGreaterThan(10);
    expect(dist).toBeLessThan(25);
  });

  test("calculates distance between distant sectors (MG Road to Hebbal ~8.8km)", () => {
    const dist = calculateHaversineDistanceMeters(12.97562, 77.60685, 13.03582, 77.59701);
    expect(dist).toBeGreaterThan(6000);
    expect(dist).toBeLessThan(10000);
  });
});

describe("Civic Engine - Text & Synonym Similarity", () => {
  test("returns 1.0 for identical sentences", () => {
    const text = "Clogged storm water culvert causing severe waterlogging";
    const sim = calculateTextSimilarity(text, text);
    expect(sim).toBe(1.0);
  });

  test("matches civic synonyms like pothole and crater", () => {
    const textA = "Deep crater in the road asphalt";
    const textB = "Massive pothole in tarmac";
    const sim = calculateTextSimilarity(textA, textB);
    expect(sim).toBeGreaterThan(0.3);
  });

  test("matches flood and waterlogging synonyms", () => {
    const textA = "Knee-deep flood on pedestrian walkway";
    const textB = "Severe waterlogging submerging sidewalk";
    const sim = calculateTextSimilarity(textA, textB);
    expect(sim).toBeGreaterThan(0.25);
  });

  test("returns 0 or near 0 for completely unrelated issues", () => {
    const textA = "Overhanging tree branch near garden compost";
    const textB = "Sparking live transformer submerged in water";
    const sim = calculateTextSimilarity(textA, textB);
    expect(sim).toBeLessThan(0.15);
  });
});

describe("Civic Engine - Duplicate Detection", () => {
  test("detects duplicate report within 250m with matching keywords", () => {
    const candidate = {
      title: "Clogged stormwater drain grill on MG Road",
      description: "Grating full of plastic bottles and silt overflowing onto walkway",
      latitude: 12.97565,
      longitude: 77.60688,
      category: "WATERLOGGING" as const,
    };

    const result = findLikelyDuplicates(candidate, INITIAL_SYNTHETIC_REPORTS);
    expect(result.is_likely_duplicate).toBe(true);
    expect(result.matched_duplicate_id).toBeTruthy();
    expect(result.duplicate_similarity).toBeGreaterThan(0.5);
    expect(result.distance_meters).toBeLessThan(100);
  });

  test("does not flag report in a different sector (>250m) as duplicate", () => {
    const candidate = {
      title: "Clogged stormwater drain grill",
      description: "Grating full of plastic bottles and silt",
      latitude: 12.9251, // Jayanagar, ~7km away from MG Road
      longitude: 77.5938,
      category: "WATERLOGGING" as const,
    };

    const mgRoadReports = INITIAL_SYNTHETIC_REPORTS.filter((r) => r.sub_area.includes("MG Road"));
    const result = findLikelyDuplicates(candidate, mgRoadReports);
    expect(result.is_likely_duplicate).toBe(false);
  });
});

describe("Civic Engine - Explainable Priority Scoring", () => {
  test("assigns CRITICAL priority (>90) to life-safety hazard in water", () => {
    const report = {
      category: "ELECTRICAL_HAZARD" as const,
      title: "Exposed live wire sparking in knee-deep floodwater",
      description: "Severe shock danger near busy metro entrance",
      latitude: 12.9756,
      longitude: 77.6069,
      sub_area: "Sector 1: MG Road Metro Corridor",
    };

    const mgRoadReports = INITIAL_SYNTHETIC_REPORTS.filter((r) => r.sub_area.includes("MG Road"));
    const priority = computeExplainablePriority(report, mgRoadReports);

    expect(priority.priority_score).toBeGreaterThanOrEqual(90);
    expect(priority.priority_level).toBe("CRITICAL");
    expect(priority.priority_factors.safetyRiskScore).toBeGreaterThanOrEqual(35);
    expect(priority.priority_factors.cascadeImpactScore).toBeGreaterThanOrEqual(20);
    expect(priority.ai_explanation).toContain("Life Safety");
  });

  test("assigns LOW or MEDIUM priority (<55) to routine residential requests", () => {
    const report = {
      category: "ROAD_DAMAGE" as const,
      title: "Slight paint fading on residential speed breaker",
      description: "Thermoplastic markings are somewhat dull",
      latitude: 12.9338,
      longitude: 77.6261,
      sub_area: "Sector 5: Koramangala Drain Belt",
    };

    const priority = computeExplainablePriority(report, []);
    expect(priority.priority_score).toBeLessThanOrEqual(55);
    expect(["LOW", "MEDIUM"]).toContain(priority.priority_level);
  });

  test("priority factors mathematically sum to total priority score", () => {
    const report = INITIAL_SYNTHETIC_REPORTS[0];
    const priority = computeExplainablePriority(report, INITIAL_SYNTHETIC_REPORTS);
    const { safetyRiskScore, cascadeImpactScore, duplicateVolumeScore, vulnerabilityScore } =
      priority.priority_factors;
    const factorSum = safetyRiskScore + cascadeImpactScore + duplicateVolumeScore + vulnerabilityScore;
    expect(Math.min(100, factorSum)).toBe(priority.priority_score);
  });
});

describe("Civic Engine - Hotspot Cluster Detection", () => {
  test("detects multi-issue clusters from pre-seeded 36 reports", () => {
    const clusters = detectGeographicClusters(INITIAL_SYNTHETIC_REPORTS);
    expect(clusters.length).toBeGreaterThanOrEqual(3);

    // Verify top cluster has multiple categories (interconnected problems)
    const topCluster = clusters[0];
    expect(topCluster.reportCount).toBeGreaterThanOrEqual(5);
    expect(topCluster.categories.length).toBeGreaterThanOrEqual(2);
    expect(topCluster.compositeRiskScore).toBeGreaterThanOrEqual(80);
    expect(topCluster.centroid.latitude).toBeDefined();
    expect(topCluster.centroid.longitude).toBeDefined();
  });
});

describe("Civic Engine - Zod Input & State Validators", () => {
  test("validates all 36 pre-seeded reports conform to CivicReportSchema", () => {
    for (const report of INITIAL_SYNTHETIC_REPORTS) {
      const parsed = CivicReportSchema.safeParse(report);
      expect(parsed.success).toBe(true);
    }
  });

  test("validates valid citizen submission input", () => {
    const valid = {
      title: "Broken water line spilling into street",
      description: "Pipe cracked under sidewalk sending potable water everywhere",
      category: "WATER_SUPPLY",
      sub_area: "Sector 4: Indiranagar 100ft Cross",
      address: "100ft Road, opposite KFC",
      latitude: 12.9784,
      longitude: 77.6408,
    };
    const parsed = SubmitReportInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  test("rejects submission with too short title or description", () => {
    const invalid = {
      title: "No",
      description: "Bad",
      sub_area: "Sector 1",
      address: "MG Road",
      latitude: 12.9,
      longitude: 77.6,
    };
    const parsed = SubmitReportInputSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  test("validates workflow dispatch update schema", () => {
    const valid = {
      reportId: "AST-101",
      status: "ASSIGNED",
      assigned_department: "STORM_DRAINAGE",
      dispatch_notes: "Hydro-jetting unit 4 dispatched to site.",
    };
    const parsed = WorkflowUpdateInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
