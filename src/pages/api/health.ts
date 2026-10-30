import type { NextApiRequest, NextApiResponse } from "next";
import { isGeminiConfigured } from "@/lib/gemini";
import { applySecurityGuard } from "@/lib/security";

/**
 * Health check and runtime telemetry status handler for CampusFix operations.
 *
 * @param req Next.js API Request
 * @param res Next.js API Response
 */
export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (
    applySecurityGuard(req, res, {
      allowedMethods: ["GET"],
      skipRateLimit: false,
    })
  ) {
    return;
  }

  res.status(200).json({
    status: "OK",
    service: "campusfix",
    googleGenAiReady: isGeminiConfigured(),
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
}
