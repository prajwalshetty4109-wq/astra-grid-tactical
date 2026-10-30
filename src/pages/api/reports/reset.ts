import type { NextApiRequest, NextApiResponse } from "next";
import { resetAllReports } from "@/lib/reportStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await resetAllReports();
    return res.status(200).json({
      success: true,
      message: "Civic operational state reset to 36 baseline synthetic reports",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("State reset failed:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reset operational reports baseline",
    });
  }
}

