import { CivicReport, PriorityFactors, PriorityLevel, HotspotCluster, CivicCategory } from "./validators";

/**
 * Calculates the Great-Circle distance between two coordinates in meters using the Haversine formula.
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's mean radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Civic synonym groups for domain-specific text similarity boosting
const CIVIC_SYNONYMS: Record<string, string[]> = {
  pothole: ["crater", "road", "tarmac", "asphalt", "hole", "cavity", "skid", "broken"],
  flood: ["waterlogging", "submerged", "submerging", "standing", "water", "inundated", "flood", "flooding", "ponding"],
  drain: ["culvert", "gutter", "stormwater", "drainage", "clogged", "blocked", "choked", "sewage"],
  electrical: ["wire", "feeder", "pillar", "transformer", "sparking", "shock", "electrocution", "live", "current"],
  waste: ["garbage", "trash", "overflowing", "dump", "bin", "refuse", "litter", "spill"],
  light: ["streetlight", "lamp", "dark", "illumination", "outage", "led", "pole", "flickering"],
  water: ["pipe", "pipeline", "leak", "rupture", "pressure", "supply", "burst", "flow"],
  pedestrian: ["footpath", "walkway", "sidewalk", "pavement", "crossing", "curb", "pedestrian"],
};

/**
 * Normalizes text and tokenizes into lower-case distinct words removing common stop words.
 */
function tokenizeText(text: string): Set<string> {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "are", "was", "were", "this", "that", "there", "it"
  ]);

  const clean = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return new Set(clean);
}

/**
 * Computes semantic similarity between two texts using token Jaccard + civic synonym cross-matching.
 * Returns a score between 0.0 and 1.0.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;

  const tokensA = tokenizeText(textA);
  const tokensB = tokenizeText(textB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  // Direct intersection
  let directMatches = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      directMatches++;
    }
  }

  // Synonym assisted matches
  let synonymMatches = 0;
  for (const tokenA of tokensA) {
    if (!tokensB.has(tokenA)) {
      for (const [key, group] of Object.entries(CIVIC_SYNONYMS)) {
        if (tokenA === key || group.includes(tokenA)) {
          const hasSynonymInB = [...tokensB].some(
            (tokenB) => tokenB === key || group.includes(tokenB)
          );
          if (hasSynonymInB) {
            synonymMatches += 0.8;
            break;
          }
        }
      }
    }
  }

  const effectiveMatches = directMatches + synonymMatches;
  const minSize = Math.min(tokensA.size, tokensB.size);
  const totalTokens = tokensA.size + tokensB.size;

  if (totalTokens === 0) return 0;
  const dice = (2 * effectiveMatches) / totalTokens;
  const containment = minSize > 0 ? effectiveMatches / minSize : 0;
  const score = Math.min(1.0, dice * 0.6 + containment * 0.4);

  return Math.round(score * 100) / 100;
}

export interface DuplicateDetectionResult {
  is_likely_duplicate: boolean;
  matched_duplicate_id: string | null;
  duplicate_similarity: number;
  duplicate_reasoning: string;
  distance_meters?: number;
}

/**
 * Identifies duplicate reports within 250m using combined spatial and semantic similarity.
 */
export function findLikelyDuplicates(
  candidate: {
    id?: string;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    category?: CivicCategory;
  },
  existingReports: CivicReport[]
): DuplicateDetectionResult {
  let highestSimilarity = 0;
  let bestMatch: CivicReport | null = null;
  let closestDistance = Infinity;

  const candidateText = `${candidate.title} ${candidate.description}`;

  for (const report of existingReports) {
    // Avoid self-match
    if (candidate.id && report.id === candidate.id) continue;

    const distance = calculateHaversineDistanceMeters(
      candidate.latitude,
      candidate.longitude,
      report.latitude,
      report.longitude
    );

    // Only compare reports within 250m radius
    if (distance <= 250) {
      const reportText = `${report.title} ${report.description}`;
      const textSim = calculateTextSimilarity(candidateText, reportText);

      // Same category gets a boost
      const categoryMatch = candidate.category && report.category === candidate.category;
      const categoryMultiplier = categoryMatch ? 1.25 : 0.85;

      // Spatial decay factor: 1.0 at 0m, 0.7 at 250m
      const spatialWeight = 1.0 - (distance / 250) * 0.3;

      const combinedScore = Math.min(1.0, textSim * spatialWeight * categoryMultiplier);

      if (combinedScore > highestSimilarity) {
        highestSimilarity = combinedScore;
        bestMatch = report;
        closestDistance = distance;
      }
    }
  }

  // Threshold for considering a report a likely duplicate
  if (bestMatch && highestSimilarity >= 0.45) {
    return {
      is_likely_duplicate: true,
      matched_duplicate_id: bestMatch.id,
      duplicate_similarity: Math.round(highestSimilarity * 100) / 100,
      duplicate_reasoning: `Located ${closestDistance}m from ${bestMatch.id} (${bestMatch.title}) with ${(highestSimilarity * 100).toFixed(0)}% semantic/spatial correlation. Corroborates active citizen report.`,
      distance_meters: closestDistance,
    };
  }

  return {
    is_likely_duplicate: false,
    matched_duplicate_id: null,
    duplicate_similarity: highestSimilarity > 0 ? Math.round(highestSimilarity * 100) / 100 : 0,
    duplicate_reasoning: "No duplicate complaints detected within 250m radius. Registered as a distinct primary incident.",
    distance_meters: closestDistance !== Infinity ? closestDistance : undefined,
  };
}

/**
 * Computes deterministic factor-based explainable priority scoring (0-100).
 */
export function computeExplainablePriority(
  report: {
    category: CivicCategory;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    sub_area: string;
  },
  nearbyReports: CivicReport[] = []
): {
  priority_score: number;
  priority_level: PriorityLevel;
  priority_factors: PriorityFactors;
  ai_explanation: string;
} {
  const combinedText = `${report.title} ${report.description}`.toLowerCase();

  // 1. Safety & Life Risk Score (0-40)
  let safetyRiskScore = 15; // Baseline
  if (
    report.category === "ELECTRICAL_HAZARD" ||
    combinedText.includes("live wire") ||
    combinedText.includes("sparking") ||
    combinedText.includes("electrocution") ||
    combinedText.includes("shock")
  ) {
    safetyRiskScore = combinedText.includes("water") || combinedText.includes("flood") ? 39 : 35;
  } else if (
    combinedText.includes("open manhole") ||
    combinedText.includes("crater") ||
    combinedText.includes("deep pothole") ||
    combinedText.includes("skid") ||
    combinedText.includes("accident")
  ) {
    safetyRiskScore = 32;
  } else if (report.category === "WATERLOGGING" && combinedText.includes("knee-deep")) {
    safetyRiskScore = 28;
  } else if (report.category === "ROAD_DAMAGE") {
    safetyRiskScore = 22;
  } else if (report.category === "WASTE_OVERFLOW" && combinedText.includes("hospital")) {
    safetyRiskScore = 24;
  } else if (report.category === "STREETLIGHT_OUTAGE" && combinedText.includes("dark")) {
    safetyRiskScore = 18;
  } else if (report.category === "WATER_SUPPLY" && combinedText.includes("rupture")) {
    safetyRiskScore = 22;
  }

  // 2. Cascade Impact Score (0-25)
  let cascadeImpactScore = 10;
  if (
    (report.category === "WATERLOGGING" && combinedText.includes("drain")) ||
    (report.category === "ROAD_DAMAGE" && combinedText.includes("submerged"))
  ) {
    cascadeImpactScore = 24;
  } else if (report.category === "ELECTRICAL_HAZARD" && combinedText.includes("flood")) {
    cascadeImpactScore = 25;
  } else if (combinedText.includes("culvert") || combinedText.includes("clogged drain")) {
    cascadeImpactScore = 23;
  } else if (combinedText.includes("hospital") || combinedText.includes("ambulance")) {
    cascadeImpactScore = 21;
  } else if (report.category === "WATER_SUPPLY" && combinedText.includes("flooding flyover")) {
    cascadeImpactScore = 22;
  } else {
    cascadeImpactScore = 12;
  }

  // 3. Duplicate Volume / Citizen Corroboration Score (0-20)
  // Count how many reports are within 250m
  const nearbyCount = nearbyReports.filter((r) => {
    const dist = calculateHaversineDistanceMeters(
      report.latitude,
      report.longitude,
      r.latitude,
      r.longitude
    );
    return dist <= 250;
  }).length;

  let duplicateVolumeScore = 6;
  if (nearbyCount >= 6) {
    duplicateVolumeScore = 20;
  } else if (nearbyCount >= 4) {
    duplicateVolumeScore = 17;
  } else if (nearbyCount >= 2) {
    duplicateVolumeScore = 13;
  } else if (nearbyCount >= 1) {
    duplicateVolumeScore = 9;
  }

  // 4. Vulnerable Zone Proximity (0-15)
  let vulnerabilityScore = 7;
  const areaLower = report.sub_area.toLowerCase() + " " + combinedText;
  if (
    areaLower.includes("hospital") ||
    areaLower.includes("school") ||
    areaLower.includes("ambulance")
  ) {
    vulnerabilityScore = 15;
  } else if (
    areaLower.includes("metro") ||
    areaLower.includes("station") ||
    areaLower.includes("transit") ||
    areaLower.includes("bus bay")
  ) {
    vulnerabilityScore = 14;
  } else if (
    areaLower.includes("flyover") ||
    areaLower.includes("arterial") ||
    areaLower.includes("corridor")
  ) {
    vulnerabilityScore = 12;
  } else {
    vulnerabilityScore = 8;
  }

  const priority_score = Math.min(
    100,
    safetyRiskScore + cascadeImpactScore + duplicateVolumeScore + vulnerabilityScore
  );

  let priority_level: PriorityLevel = "LOW";
  if (priority_score >= 80) priority_level = "CRITICAL";
  else if (priority_score >= 65) priority_level = "HIGH";
  else if (priority_score >= 40) priority_level = "MEDIUM";

  const ai_explanation = `Ranked ${priority_score}/100 (${priority_level}) via multi-factor civic engine: Life Safety (${safetyRiskScore}/40) due to ${
    safetyRiskScore > 30 ? "immediate physical hazard or electrocution risk" : "pedestrian & vehicular hazard profile"
  }, Cascade Impact (${cascadeImpactScore}/25) from ${
    cascadeImpactScore > 20 ? "systemic secondary infrastructure coupling" : "localized sector impact"
  }, Citizen Corroboration (${duplicateVolumeScore}/20) with ${nearbyCount} verified nearby reports within 250m, and Zone Sensitivity (${vulnerabilityScore}/15) based on proximity to high-density arterial civic transit nodes.`;

  return {
    priority_score,
    priority_level,
    priority_factors: {
      safetyRiskScore,
      cascadeImpactScore,
      duplicateVolumeScore,
      vulnerabilityScore,
    },
    ai_explanation,
  };
}

/**
 * Spatially groups reports within 300m into multi-issue Hotspot Clusters.
 */
export function detectGeographicClusters(reports: CivicReport[]): HotspotCluster[] {
  const visited = new Set<string>();
  const clusters: HotspotCluster[] = [];

  for (const report of reports) {
    if (visited.has(report.id)) continue;

    // Find all interconnected reports within 300m
    const clusterReports: CivicReport[] = [report];
    visited.add(report.id);

    for (const other of reports) {
      if (visited.has(other.id)) continue;

      const dist = calculateHaversineDistanceMeters(
        report.latitude,
        report.longitude,
        other.latitude,
        other.longitude
      );

      if (dist <= 300) {
        clusterReports.push(other);
        visited.add(other.id);
      }
    }

    // Only identify as a hotspot cluster if 3 or more reports cluster together
    if (clusterReports.length >= 3) {
      const avgLat =
        clusterReports.reduce((sum, r) => sum + r.latitude, 0) / clusterReports.length;
      const avgLon =
        clusterReports.reduce((sum, r) => sum + r.longitude, 0) / clusterReports.length;

      let maxDist = 0;
      for (const r of clusterReports) {
        const d = calculateHaversineDistanceMeters(avgLat, avgLon, r.latitude, r.longitude);
        if (d > maxDist) maxDist = d;
      }

      const criticalCount = clusterReports.filter((r) => r.priority_level === "CRITICAL").length;
      const categories = Array.from(new Set(clusterReports.map((r) => r.category)));

      const maxPriority = Math.max(...clusterReports.map((r) => r.priority_score));
      const compositeRiskScore = Math.min(
        100,
        Math.round(maxPriority * 0.7 + clusterReports.length * 3 + criticalCount * 4)
      );

      // Determine corridor name from sub_area
      const primaryArea = clusterReports[0].sub_area || "Urban Corridor";
      const clusterId = `HOTSPOT-${clusters.length + 1}`;

      clusters.push({
        id: clusterId,
        title: `${primaryArea} Hotspot Cluster`,
        centroid: {
          latitude: Number(avgLat.toFixed(6)),
          longitude: Number(avgLon.toFixed(6)),
        },
        radiusMeters: Math.max(80, Math.round(maxDist)),
        reportCount: clusterReports.length,
        criticalCount,
        categories,
        compositeRiskScore,
        reports: clusterReports,
        primaryCorridor: primaryArea,
      });
    }
  }

  // Sort clusters by composite risk descending
  return clusters.sort((a, b) => b.compositeRiskScore - a.compositeRiskScore);
}
