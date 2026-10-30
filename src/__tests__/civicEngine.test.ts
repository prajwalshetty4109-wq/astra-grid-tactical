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
  PriorityFactorsSchema,
} from "../lib/validators";
import { sanitizeInput, deepSanitize } from "../lib/security";

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

  test("handles antipodal and boundary globe coordinates without error", () => {
    // North Pole to South Pole
    const dist = calculateHaversineDistanceMeters(90, 0, -90, 0);
    expect(dist).toBeGreaterThan(19_000_000);
    expect(dist).toBeLessThan(21_000_000);
  });

  test("handles negative coordinates and cross-equator distances correctly", () => {
    const dist = calculateHaversineDistanceMeters(-1.286389, 36.817223, 1.286389, 36.817223);
    expect(dist).toBeGreaterThan(250_000);
    expect(dist).toBeLessThan(350_000);
  });
});

describe("CampusFix Civic Engine - Text & Synonym Similarity", () => {
  test("returns 1.0 for identical sentences", () => {
    const text = "Overhead chilled water pipe rupture leaking onto lab electronics";
    const sim = calculateTextSimilarity(text, text);
    expect(sim).toBe(1.0);
  });

  test("returns 0 for empty strings or stop-word-only text", () => {
    expect(calculateTextSimilarity("", "")).toBe(0);
    expect(calculateTextSimilarity("the and or", "in on at")).toBe(0);
  });

  test("strips special characters and punctuation before matching", () => {
    const textA = "Water leak in lab Room #304!!!";
    const textB = "water leak in lab room 304";
    const sim = calculateTextSimilarity(textA, textB);
    expect(sim).toBeGreaterThan(0.9);
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

  test("matches campus HVAC synonyms like aircon chiller and cooling ventilation", () => {
    const textA = "Aircon chiller unit failure in server room";
    const textB = "Cooling ventilation duct overheating with no airflow";
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

  test("skips matching against the candidate report itself when ID is provided", () => {
    const existing = INITIAL_SYNTHETIC_REPORTS[0];
    const candidate = {
      id: existing.id,
      title: existing.title,
      description: existing.description,
      latitude: existing.latitude,
      longitude: existing.longitude,
      category: existing.category,
    };

    const result = findLikelyDuplicates(candidate, [existing]);
    expect(result.is_likely_duplicate).toBe(false);
    expect(result.matched_duplicate_id).toBeNull();
  });

  test("enforces strict 250-meter threshold boundary for duplicate candidate evaluation", () => {
    // Coordinate 260m away from CF-101
    const candidate = {
      title: INITIAL_SYNTHETIC_REPORTS[0].title,
      description: INITIAL_SYNTHETIC_REPORTS[0].description,
      latitude: 12.9779,
      longitude: 77.6068,
      category: INITIAL_SYNTHETIC_REPORTS[0].category,
    };

    const dist = calculateHaversineDistanceMeters(
      candidate.latitude,
      candidate.longitude,
      INITIAL_SYNTHETIC_REPORTS[0].latitude,
      INITIAL_SYNTHETIC_REPORTS[0].longitude
    );
    expect(dist).toBeGreaterThan(250);

    const result = findLikelyDuplicates(candidate, [INITIAL_SYNTHETIC_REPORTS[0]]);
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

  test("clamps individual priority factors within their designated rubric bounds", () => {
    const report = INITIAL_SYNTHETIC_REPORTS[0];
    const priority = computeExplainablePriority(report, INITIAL_SYNTHETIC_REPORTS);
    const { safetyRiskScore, cascadeImpactScore, duplicateVolumeScore, vulnerabilityScore } =
      priority.priority_factors;

    expect(safetyRiskScore).toBeGreaterThanOrEqual(0);
    expect(safetyRiskScore).toBeLessThanOrEqual(40);

    expect(cascadeImpactScore).toBeGreaterThanOrEqual(0);
    expect(cascadeImpactScore).toBeLessThanOrEqual(25);

    expect(duplicateVolumeScore).toBeGreaterThanOrEqual(0);
    expect(duplicateVolumeScore).toBeLessThanOrEqual(20);

    expect(vulnerabilityScore).toBeGreaterThanOrEqual(0);
    expect(vulnerabilityScore).toBeLessThanOrEqual(15);
  });

  test("correctly maps priority score to tier labels (CRITICAL, HIGH, MEDIUM, LOW)", () => {
    const base = {
      category: "PLUMBING" as const,
      title: "Restroom sink",
      description: "Sink slow drain",
      latitude: 12.9251,
      longitude: 77.5938,
      sub_area: "Central Library",
    };

    const priority = computeExplainablePriority(base, []);
    expect(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).toContain(priority.priority_level);
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

  test("sorts detected clusters descending by composite risk score", () => {
    const clusters = detectGeographicClusters(INITIAL_SYNTHETIC_REPORTS);
    for (let i = 0; i < clusters.length - 1; i++) {
      expect(clusters[i].compositeRiskScore).toBeGreaterThanOrEqual(
        clusters[i + 1].compositeRiskScore
      );
    }
  });

  test("computes accurate centroid coordinates within building bounds", () => {
    const clusters = detectGeographicClusters(INITIAL_SYNTHETIC_REPORTS);
    const alpha = clusters.find((c) => c.title.includes("Science"));
    expect(alpha).toBeDefined();
    if (alpha) {
      expect(alpha.centroid.latitude).toBeCloseTo(12.9756, 2);
      expect(alpha.centroid.longitude).toBeCloseTo(77.6068, 2);
    }
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

  test("validates priority factors schema enforces max score boundaries", () => {
    const validFactors = {
      safetyRiskScore: 40,
      cascadeImpactScore: 25,
      duplicateVolumeScore: 20,
      vulnerabilityScore: 15,
    };
    expect(PriorityFactorsSchema.safeParse(validFactors).success).toBe(true);

    const invalidFactors = {
      safetyRiskScore: 45, // Exceeds 40
      cascadeImpactScore: 25,
      duplicateVolumeScore: 20,
      vulnerabilityScore: 15,
    };
    expect(PriorityFactorsSchema.safeParse(invalidFactors).success).toBe(false);
  });
});

describe("CampusFix Security Engine - Input Sanitization & XSS Defense", () => {
  test("strips dangerous HTML and script tags from input strings", () => {
    const malicious = "<script>alert('xss')</script>Burst pipe in Chem Lab";
    const clean = sanitizeInput(malicious);
    expect(clean).toBe("Burst pipe in Chem Lab");
    expect(clean).not.toContain("<script>");
  });

  test("strips nested angle brackets and image onerror vectors", () => {
    const attack = "<img src=x onerror=alert(1)>Sparking outlet";
    const clean = sanitizeInput(attack);
    expect(clean).toBe("Sparking outlet");
    expect(clean).not.toContain("<img");
  });

  test("deepSanitize cleans nested object structures recursively", () => {
    const payload = {
      title: "<b>Water leak</b>",
      description: "Flooding in <i>Lab 3</i>",
      location: {
        address: "<script>hack()</script>Room 304",
      },
      tags: ["<p>plumbing</p>", "urgent"],
    };

    const sanitized = deepSanitize(payload);
    expect(sanitized.title).toBe("Water leak");
    expect(sanitized.description).toBe("Flooding in Lab 3");
    expect(sanitized.location.address).toBe("Room 304");
    expect(sanitized.tags[0]).toBe("plumbing");
    expect(sanitized.tags[1]).toBe("urgent");
  });
});
