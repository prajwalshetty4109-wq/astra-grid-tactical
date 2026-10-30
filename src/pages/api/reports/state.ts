import type { NextApiRequest, NextApiResponse } from "next";
import { fetchAllReports } from "@/lib/reportStore";
import { detectGeographicClusters } from "@/lib/civicEngine";
import { CivicReport } from "@/lib/validators";
import { applySecurityGuard } from "@/lib/security";

/**
 * Endpoint retrieving the global operational state of campus facility tickets,
 * spatial building clusters, duplicate chains, and system KPIs.
 *
 * @param req Next.js API Request
 * @param res Next.js API Response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (
    applySecurityGuard(req, res, {
      allowedMethods: ["GET"],
      skipRateLimit: false,
    })
  ) {
    return;
  }

  try {
    const reports = await fetchAllReports();
    const clusters = detectGeographicClusters(reports);

    // Group duplicate chains
    const duplicateMap = new Map<string, CivicReport[]>();
    for (const report of reports) {
      if (report.duplicate_of_id) {
        const existing = duplicateMap.get(report.duplicate_of_id) || [];
        existing.push(report);
        duplicateMap.set(report.duplicate_of_id, existing);
      }
    }

    const duplicateChains = Array.from(duplicateMap.entries()).map(
      ([parentId, dups]) => ({
        parentId,
        duplicates: dups,
        count: dups.length,
      })
    );

    const totalReports = reports.length;
    const criticalCount = reports.filter((r) => r.priority_level === "CRITICAL").length;
    const highCount = reports.filter((r) => r.priority_level === "HIGH").length;
    const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;
    const inProgressCount = reports.filter((r) => r.status === "IN_PROGRESS").length;
    const duplicatesDetected = reports.filter(
      (r) => Boolean(r.duplicate_of_id) || (r.duplicate_count || 1) > 1
    ).length;

    const avgPriorityScore =
      totalReports > 0
        ? Math.round(
            reports.reduce((sum, r) => sum + r.priority_score, 0) / totalReports
          )
        : 0;

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      reports,
      clusters,
      duplicateChains,
      kpis: {
        totalReports,
        criticalCount,
        highCount,
        resolvedCount,
        inProgressCount,
        duplicatesDetected,
        activeHotspots: clusters.length,
        avgPriorityScore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve civic operational state",
    });
  }
}
