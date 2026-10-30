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

describe("CampusFix Civic Engine - Haversine Distance Calculation", () => {
  test("returns 0 meters for identical coordinates", () => {
    const dist = calculateHaversineDistanceMeters(12.97562, 77.60685, 12.97562, 77.60685);
    expect(dist).toBe(0);
  });

  test("accurately calculates short campus building distances (~10 to 25 meters)", () => {
    // CF-101 and CF-102 coordinates in Science Block
    const dist = calculateHaversineDistanceMeters(12.97562, 77.60685, 12.97571, 77.60692);
    expect(dist).toBeGreaterThan(10);
    expect(dist).toBeLessThan(25);
  });

  test("calculates distance across campus sectors (Science Block to Dorms ~8.8km)", () => {
    const dist = calculateHaversineDistanceMeters(12.97562, 77.60685, 13.03582, 77.59701);
    expect(dist).toBeGreaterThan(6000);
    expect(dist).toBeLessThan(10000);
  });
});

describe("CampusFix Civic Engine - Text & Synonym Similarity", () => {
  test("returns 1.0 for identical sentences", () => {
    const text = "Overhead chilled water pipe rupture leaking onto lab electronics";
    const sim = calculateTextSimilarity(text, text);
    expect(sim).toBe(1.0);
  });

  test("matches campus facility synonyms like pipe leak and water burst", () => {
    const textA = "Water pipe burst leaking onto floor";
    const textB = "Drain pipe rupture with water flooding";
    const sim = calculateTextSimilarity(textA, textB);
    expect(sim).toBeGreaterThan(0.35);
  });

  test("matches campus IT infrastructure synonyms like wifi and router access point", () => {
    const textA = "Campus wifi network down in study commons";
    const textB = "Router access point offline dropping network connection";
    const sim = calculateTextSimilarity(textA, textB);
    expect(sim).toBeGreaterThan(0.25);
  });

  test("returns 0 or near 0 for completely unrelated issues", () => {
    const textA = "Loose wooden armrest on student auditorium chair";
    const textB = "Sparking live electrical conduit submerged in water";
    const sim = calculateTextSimilarity(textA, textB);
    expect(sim).toBeLessThan(0.15);
  });
});

describe("CampusFix Civic Engine - Duplicate Detection", () => {
  test("detects duplicate campus complaint within building corridor with matching keywords", () => {
    const candidate = {
      title: "Ceiling water pipe leak dripping into Chem Lab 304",
      description: "Water pouring through acoustic tiles onto lab workbenches",
      latitude: 12.97565,
      longitude: 77.60688,
      category: "PLUMBING" as const,
    };

    const result = findLikelyDuplicates(candidate, INITIAL_SYNTHETIC_REPORTS);
    expect(result.is_likely_duplicate).toBe(true);
    expect(result.matched_duplicate_id).toBeTruthy();
    expect(result.duplicate_similarity).toBeGreaterThan(0.45);
    expect(result.distance_meters).toBeLessThan(100);
  });

  test("does not flag report in a distant building (>250m) as duplicate", () => {
    const candidate = {
      title: "Ceiling water pipe leak dripping",
      description: "Water pouring through tiles onto tables",
      latitude: 12.9251, // Library, ~7km away from Science Block
      longitude: 77.5938,
      category: "PLUMBING" as const,
    };

    const scienceReports = INITIAL_SYNTHETIC_REPORTS.filter((r) => r.sub_area.includes("Science"));
    const result = findLikelyDuplicates(candidate, scienceReports);
    expect(result.is_likely_duplicate).toBe(false);
  });
});

describe("CampusFix Civic Engine - Explainable Priority Scoring", () => {
  test("assigns CRITICAL priority (>90) to sparking electrical hazard in wet lab", () => {
    const report = {
      category: "ELECTRICAL" as const,
      title: "Sparking 220V wall outlet submerged in ceiling leak runoff",
      description: "Active smoke and electrical arcing near chemical benches",
      latitude: 12.9756,
      longitude: 77.6069,
      sub_area: "Science Block Wing B",
    };

    const scienceReports = INITIAL_SYNTHETIC_REPORTS.filter((r) => r.sub_area.includes("Science"));
    const priority = computeExplainablePriority(report, scienceReports);

    expect(priority.priority_score).toBeGreaterThanOrEqual(90);
    expect(priority.priority_level).toBe("CRITICAL");
    expect(priority.priority_factors.safetyRiskScore).toBeGreaterThanOrEqual(35);
    expect(priority.priority_factors.cascadeImpactScore).toBeGreaterThanOrEqual(20);
    expect(priority.ai_explanation).toContain("Safety & Hazard");
  });

  test("assigns LOW priority (<40) to minor classroom furniture defects", () => {
    const report = {
      category: "FURNITURE" as const,
      title: "Bent marker tray on seminar room whiteboard",
      description: "Dry-erase tray is slightly bent at corner",
      latitude: 12.9765,
      longitude: 77.6421,
      sub_area: "Engineering Wing",
    };

    const priority = computeExplainablePriority(report, []);
    expect(priority.priority_score).toBeLessThanOrEqual(40);
    expect(priority.priority_level).toBe("LOW");
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

describe("CampusFix Civic Engine - Hotspot Cluster Detection", () => {
  test("detects multi-issue building clusters from pre-seeded 36 campus reports", () => {
    const clusters = detectGeographicClusters(INITIAL_SYNTHETIC_REPORTS);
    expect(clusters.length).toBeGreaterThanOrEqual(3);

    const topCluster = clusters[0];
    expect(topCluster.reportCount).toBeGreaterThanOrEqual(5);
    expect(topCluster.categories.length).toBeGreaterThanOrEqual(2);
    expect(topCluster.compositeRiskScore).toBeGreaterThanOrEqual(80);
    expect(topCluster.centroid.latitude).toBeDefined();
    expect(topCluster.centroid.longitude).toBeDefined();
  });
});

describe("CampusFix Civic Engine - Zod Input & State Validators", () => {
  test("validates all 36 pre-seeded reports conform to CivicReportSchema", () => {
    for (const report of INITIAL_SYNTHETIC_REPORTS) {
      const parsed = CivicReportSchema.safeParse(report);
      expect(parsed.success).toBe(true);
    }
  });

  test("validates valid student submission input", () => {
    const valid = {
      title: "Restroom faucet leaking continuously",
      description: "Sink faucet #3 won't shut off and is overflowing onto the floor",
      category: "PLUMBING",
      sub_area: "Central Library Commons",
      address: "1st Floor Restrooms, Library",
      latitude: 12.9251,
      longitude: 77.5938,
    };
    const parsed = SubmitReportInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  test("rejects submission with too short title or description", () => {
    const invalid = {
      title: "No",
      description: "Bad",
      sub_area: "Science",
      address: "Room 101",
      latitude: 12.9,
      longitude: 77.6,
    };
    const parsed = SubmitReportInputSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  test("validates workflow dispatch update schema", () => {
    const valid = {
      reportId: "CF-101",
      status: "ASSIGNED",
      assigned_department: "PLUMBING_OPS",
      dispatch_notes: "Emergency plumbing crew dispatched to isolate ceiling riser valve.",
    };
    const parsed = WorkflowUpdateInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
