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

// Campus facility domain synonym dictionary
const CAMPUS_SYNONYMS: Record<string, string[]> = {
  plumbing: ["leak", "pipe", "burst", "drain", "water", "faucet", "restroom", "toilet", "flood", "sewage", "drip", "tap", "sink", "clogged"],
  electrical: ["sparking", "outlet", "socket", "wire", "breaker", "shock", "voltage", "switch", "short", "plug", "power", "feeder"],
  it_network: ["wifi", "network", "internet", "wireless", "eduroam", "lan", "connection", "router", "ap", "access", "point", "ethernet", "online"],
  hvac: ["ac", "aircon", "cooling", "chiller", "ventilation", "heating", "temperature", "duct", "blower", "thermostat", "airflow", "condenser"],
  sanitation: ["trash", "garbage", "bin", "chute", "odor", "stench", "cleaning", "spill", "restroom", "waste", "overflowing", "dumpster"],
  furniture: ["chair", "desk", "table", "carrel", "whiteboard", "projector", "podium", "door", "hinge", "lock", "handle", "bench"],
  hazard: ["danger", "smoke", "fire", "electrocution", "slip", "collapse", "emergency", "arcing", "live"],
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
 * Computes semantic similarity between two texts using token Dice + containment + campus synonym cross-matching.
 * Returns a score between 0.0 and 1.0.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;

  const tokensA = Array.from(tokenizeText(textA));
  const tokensBSet = tokenizeText(textB);

  if (tokensA.length === 0 || tokensBSet.size === 0) return 0;

  // Direct intersection
  let directMatches = 0;
  for (const token of tokensA) {
    if (tokensBSet.has(token)) {
      directMatches++;
    }
  }

  // Synonym assisted matches
  let synonymMatches = 0;
  for (const tokenA of tokensA) {
    if (!tokensBSet.has(tokenA)) {
      for (const [key, group] of Object.entries(CAMPUS_SYNONYMS)) {
        if (tokenA === key || group.includes(tokenA)) {
          const hasSynonymInB = Array.from(tokensBSet).some(
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
  const totalTokens = tokensA.length + tokensBSet.size;
  const minSize = Math.min(tokensA.length, tokensBSet.size);

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
 * Identifies duplicate campus facility reports within 250m using combined spatial and semantic similarity.
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
    if (candidate.id && report.id === candidate.id) continue;

    const distance = calculateHaversineDistanceMeters(
      candidate.latitude,
      candidate.longitude,
      report.latitude,
      report.longitude
    );

    // Campus building radius: within 250m
    if (distance <= 250) {
      const reportText = `${report.title} ${report.description}`;
      const textSim = calculateTextSimilarity(candidateText, reportText);

      // Same category gets a boost
      const categoryMatch = candidate.category && report.category === candidate.category;
      const categoryMultiplier = categoryMatch ? 1.3 : 0.85;

      // Spatial decay factor: 1.0 at 0m, 0.75 at 250m
      const spatialWeight = 1.0 - (distance / 250) * 0.25;

      const combinedScore = Math.min(1.0, textSim * spatialWeight * categoryMultiplier);

      if (combinedScore > highestSimilarity) {
        highestSimilarity = combinedScore;
        bestMatch = report;
        closestDistance = distance;
      }
    }
  }

  if (bestMatch && highestSimilarity >= 0.45) {
    return {
      is_likely_duplicate: true,
      matched_duplicate_id: bestMatch.id,
      duplicate_similarity: Math.round(highestSimilarity * 100) / 100,
      duplicate_reasoning: `Located ${closestDistance}m from Ticket #${bestMatch.id} (${bestMatch.title}) with ${(highestSimilarity * 100).toFixed(0)}% semantic/spatial correlation in ${bestMatch.sub_area}. Corroborates active facility maintenance ticket.`,
      distance_meters: closestDistance,
    };
  }

  return {
    is_likely_duplicate: false,
    matched_duplicate_id: null,
    duplicate_similarity: highestSimilarity > 0 ? Math.round(highestSimilarity * 100) / 100 : 0,
    duplicate_reasoning: "No duplicate complaints detected within building corridor. Registered as a distinct primary campus incident.",
    distance_meters: closestDistance !== Infinity ? closestDistance : undefined,
  };
}

/**
 * Computes deterministic factor-based explainable priority scoring (0-100) for campus facilities.
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

  // 1. Safety & Hazard Risk Score (0-40)
  let safetyRiskScore = 15;
  if (
    report.category === "ELECTRICAL" ||
    combinedText.includes("live wire") ||
    combinedText.includes("sparking") ||
    combinedText.includes("electrocution") ||
    combinedText.includes("short circuit") ||
    combinedText.includes("smoke")
  ) {
    safetyRiskScore = combinedText.includes("water") || combinedText.includes("leak") ? 39 : 35;
  } else if (
    combinedText.includes("server room") ||
    combinedText.includes("water leak") ||
    combinedText.includes("chemical") ||
    combinedText.includes("gas leak") ||
    combinedText.includes("ceiling collapse")
  ) {
    safetyRiskScore = 34;
  } else if (report.category === "PLUMBING" && combinedText.includes("burst")) {
    safetyRiskScore = 28;
  } else if (report.category === "HVAC" && combinedText.includes("chiller")) {
    safetyRiskScore = 22;
  } else if (report.category === "SANITATION" && combinedText.includes("cafeteria")) {
    safetyRiskScore = 22;
  } else if (report.category === "IT_INFRA" && combinedText.includes("core switch")) {
    safetyRiskScore = 20;
  } else if (report.category === "FURNITURE") {
    safetyRiskScore = 12;
  }

  // 2. Academic & Facility Cascade Impact (0-25)
  let cascadeImpactScore = 10;
  const isLabOrScience = combinedText.includes("lab") || report.sub_area.toLowerCase().includes("lab") || report.sub_area.toLowerCase().includes("science");
  if (
    (report.category === "PLUMBING" && (combinedText.includes("server") || isLabOrScience)) ||
    (report.category === "ELECTRICAL" && isLabOrScience)
  ) {
    cascadeImpactScore = 25;
  } else if (combinedText.includes("exam") || combinedText.includes("lecture hall")) {
    cascadeImpactScore = 23;
  } else if (report.category === "IT_INFRA" && (combinedText.includes("library") || combinedText.includes("campus-wide"))) {
    cascadeImpactScore = 24;
  } else if (report.category === "HVAC" && combinedText.includes("datacenter")) {
    cascadeImpactScore = 24;
  } else if (combinedText.includes("dorm") || combinedText.includes("cafeteria")) {
    cascadeImpactScore = 18;
  } else {
    cascadeImpactScore = 12;
  }

  // 3. Duplicate Volume / Student Corroboration Score (0-20)
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

  // 4. High-Occupancy Zone Proximity (0-15)
  let vulnerabilityScore = 7;
  const areaLower = report.sub_area.toLowerCase() + " " + combinedText;
  if (
    areaLower.includes("science") ||
    areaLower.includes("lab") ||
    areaLower.includes("datacenter")
  ) {
    vulnerabilityScore = 15;
  } else if (
    areaLower.includes("library") ||
    areaLower.includes("commons") ||
    areaLower.includes("auditorium")
  ) {
    vulnerabilityScore = 14;
  } else if (
    areaLower.includes("dorm") ||
    areaLower.includes("hostel") ||
    areaLower.includes("residential")
  ) {
    vulnerabilityScore = 13;
  } else if (
    areaLower.includes("cafeteria") ||
    areaLower.includes("dining")
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

  const ai_explanation = `Ranked ${priority_score}/100 (${priority_level}) via campus facility engine: Safety & Hazard (${safetyRiskScore}/40) due to ${
    safetyRiskScore > 30 ? "immediate electrical shock or equipment flood danger" : "localized occupant safety risk profile"
  }, Academic Cascade (${cascadeImpactScore}/25) from ${
    cascadeImpactScore > 20 ? "severe disruption to scheduled lectures, labs, or campus IT backbone" : "contained room-level impact"
  }, Student Corroboration (${duplicateVolumeScore}/20) with ${nearbyCount} verified reports in the building wing, and High-Occupancy Zone Sens. (${vulnerabilityScore}/15) based on critical university infrastructure sensitivity.`;

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
 * Spatially groups reports within 250m into multi-issue Building Clusters.
 */
export function detectGeographicClusters(reports: CivicReport[]): HotspotCluster[] {
  const visited = new Set<string>();
  const clusters: HotspotCluster[] = [];

  for (const report of reports) {
    if (visited.has(report.id)) continue;

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

      if (dist <= 250) {
        clusterReports.push(other);
        visited.add(other.id);
      }
    }

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

      const primaryArea = clusterReports[0].sub_area || "Campus Building";
      const clusterId = `HOTSPOT-${clusters.length + 1}`;

      clusters.push({
        id: clusterId,
        title: `${primaryArea} Multi-Issue Cluster`,
        centroid: {
          latitude: Number(avgLat.toFixed(6)),
          longitude: Number(avgLon.toFixed(6)),
        },
        radiusMeters: Math.max(60, Math.round(maxDist)),
        reportCount: clusterReports.length,
        criticalCount,
        categories,
        compositeRiskScore,
        reports: clusterReports,
        primaryCorridor: primaryArea,
      });
    }
  }

  return clusters.sort((a, b) => b.compositeRiskScore - a.compositeRiskScore);
}
