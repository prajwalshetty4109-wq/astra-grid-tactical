import type { NextApiRequest, NextApiResponse } from "next";
import { isGeminiConfigured } from "@/lib/gemini";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    status: "OK",
    service: "campusfix",
    googleGenAiReady: isGeminiConfigured(),
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
}
