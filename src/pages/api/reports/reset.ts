import type { NextApiRequest, NextApiResponse } from "next";
import { resetAllReports } from "@/lib/reportStore";
import { applySecurityGuard } from "@/lib/security";

/**
 * Administrative API endpoint resetting the operational state to 36 baseline synthetic campus reports.
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
      allowedMethods: ["POST"],
      skipRateLimit: false,
    })
  ) {
    return;
  }

  try {
    await resetAllReports();
    res.status(200).json({
      success: true,
      message: "Civic operational state reset to 36 baseline synthetic reports",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to reset operational reports baseline",
    });
  }
}
