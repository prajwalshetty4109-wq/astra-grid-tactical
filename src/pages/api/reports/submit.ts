import type { NextApiRequest, NextApiResponse } from "next";
import { SubmitReportInputSchema, CivicReport, CivicCategory } from "@/lib/validators";
import { fetchAllReports, saveNewReport } from "@/lib/reportStore";
import {
  findLikelyDuplicates,
  computeExplainablePriority,
  calculateHaversineDistanceMeters,
} from "@/lib/civicEngine";
import { getGeminiClient, isGeminiConfigured } from "@/lib/gemini";
import { applySecurityGuard, deepSanitize } from "@/lib/security";
import { GeminiContentPart, TriageReceipt } from "@/types/campus";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "6mb",
    },
  },
};

/**
 * Stage 1 Intake & Stage 2 AI Triage Handler.
 * Ingests student and staff facility reports, executes spatial duplicate detection,
 * evaluates 4-factor explainable priority, invokes Gemini 2.5 Flash for multimodal triage,
 * and saves report into operational store.
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
      maxPayloadBytes: 6 * 1024 * 1024,
      skipRateLimit: false,
    })
  ) {
    return;
  }

  const sanitizedBody = deepSanitize(req.body);
  const parseResult = SubmitReportInputSchema.safeParse(sanitizedBody);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: "Invalid campus report input",
      details: parseResult.error.format(),
    });
    return;
  }

  const input = parseResult.data;

  try {
    const existingReports = await fetchAllReports();

    // 1. Algorithmic Spatial & Semantic Duplicate Detection
    const duplicateResult = findLikelyDuplicates(
      {
        title: input.title,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        category: input.category,
      },
      existingReports
    );

    // 2. Compute Deterministic Campus Prioritization Baseline
    const nearbyReports = existingReports.filter(
      (r) =>
        calculateHaversineDistanceMeters(
          input.latitude,
          input.longitude,
          r.latitude,
          r.longitude
        ) <= 250
    );

    const initialCategory: CivicCategory = input.category || "PLUMBING";
    const deterministicPriority = computeExplainablePriority(
      {
        category: initialCategory,
        title: input.title,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        sub_area: input.sub_area,
      },
      nearbyReports
    );

    let finalCategory = initialCategory;
    let finalSummary = `${input.title} in ${input.sub_area} (${input.address})`;
    let finalPriorityScore = deterministicPriority.priority_score;
    let finalPriorityLevel = deterministicPriority.priority_level;
    let finalFactors = deterministicPriority.priority_factors;
    let finalExplanation = deterministicPriority.ai_explanation;
    let isLikelyDuplicate = duplicateResult.is_likely_duplicate;
    let matchedDuplicateId = duplicateResult.matched_duplicate_id;
    let duplicateSimilarity = duplicateResult.duplicate_similarity;
    let duplicateReasoning = duplicateResult.duplicate_reasoning;

    // 3. Invoke Google Gemini 2.5 Flash via @google/genai if configured
    if (isGeminiConfigured()) {
      try {
        const ai = getGeminiClient();

        const nearbyContext = nearbyReports.slice(0, 4).map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          distanceMeters: calculateHaversineDistanceMeters(
            input.latitude,
            input.longitude,
            r.latitude,
            r.longitude
          ),
          priority_score: r.priority_score,
        }));

        const prompt = `You are the AI Infrastructure Triage Director for CampusFix (University Facility Operations).
Analyze this newly captured student/staff facility complaint, categorize it, detect building cascades, verify duplicate status against existing reports, and assign an explainable priority score (0-100).

CAMPUS INCIDENT:
Title: "${input.title}"
Description: "${input.description}"
Reported Category: "${input.category || "NOT_SPECIFIED"}"
Location: "${input.address}" (${input.sub_area})
Coordinates: Lat ${input.latitude}, Lon ${input.longitude}

NEARBY BUILDING REPORTS WITHIN 250m:
${JSON.stringify(nearbyContext, null, 2)}

PRE-COMPUTED SPATIAL DUPLICATE HINT:
${JSON.stringify(duplicateResult, null, 2)}

ALLOWED CATEGORIES:
"IT_INFRA", "PLUMBING", "ELECTRICAL", "HVAC", "SANITATION", "FURNITURE"

Return a strictly valid JSON object following this exact schema:
{
  "category": "one of the allowed categories",
  "ai_summary": "concise 1-sentence executive summary (max 25 words)",
  "priority_score": integer between 0 and 100,
  "priority_level": "CRITICAL" (if >=80) | "HIGH" (65-79) | "MEDIUM" (40-64) | "LOW" (<40),
  "priority_factors": {
    "safetyRiskScore": integer between 0 and 40 (threat to life/injury/lab hazard),
    "cascadeImpactScore": integer between 0 and 25 (triggers lecture/exam/server room failure),
    "duplicateVolumeScore": integer between 0 and 20 (independent student confirmations),
    "vulnerabilityScore": integer between 0 and 15 (lab, library, exam hall, dorms)
  },
  "ai_explanation": "Clear justification explaining why this ticket ranks at this score compared to routine tickets",
  "is_likely_duplicate": boolean,
  "matched_duplicate_id": "Ticket ID of matched report or null",
  "duplicate_similarity": decimal between 0.0 and 1.0,
  "duplicate_reasoning": "1-sentence spatial/semantic reasoning"
}`;

        const parts: GeminiContentPart[] = [{ text: prompt }];

        if (input.image_base64) {
          const cleanBase64 = input.image_base64.replace(/^data:image\/\w+;base64,/, "");
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          });
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: parts,
          config: {
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text || "";
        if (rawText) {
          interface GeminiTriageResponse {
            category?: CivicCategory;
            ai_summary?: string;
            priority_score?: number;
            priority_level?: typeof finalPriorityLevel;
            priority_factors?: {
              safetyRiskScore?: number;
              cascadeImpactScore?: number;
              duplicateVolumeScore?: number;
              vulnerabilityScore?: number;
            };
            ai_explanation?: string;
            is_likely_duplicate?: boolean;
            matched_duplicate_id?: string | null;
            duplicate_similarity?: number;
            duplicate_reasoning?: string;
          }

          const aiJson: GeminiTriageResponse = JSON.parse(rawText);
          if (aiJson.category) finalCategory = aiJson.category;
          if (aiJson.ai_summary) finalSummary = aiJson.ai_summary;
          if (typeof aiJson.priority_score === "number") {
            finalPriorityScore = Math.min(100, Math.max(0, aiJson.priority_score));
          }
          if (aiJson.priority_level) finalPriorityLevel = aiJson.priority_level;
          if (aiJson.priority_factors) {
            finalFactors = {
              safetyRiskScore: Math.min(
                40,
                Math.max(0, aiJson.priority_factors.safetyRiskScore || 15)
              ),
              cascadeImpactScore: Math.min(
                25,
                Math.max(0, aiJson.priority_factors.cascadeImpactScore || 10)
              ),
              duplicateVolumeScore: Math.min(
                20,
                Math.max(0, aiJson.priority_factors.duplicateVolumeScore || 5)
              ),
              vulnerabilityScore: Math.min(
                15,
                Math.max(0, aiJson.priority_factors.vulnerabilityScore || 5)
              ),
            };
          }
          if (aiJson.ai_explanation) finalExplanation = aiJson.ai_explanation;
          if (typeof aiJson.is_likely_duplicate === "boolean") {
            isLikelyDuplicate = aiJson.is_likely_duplicate;
          }
          if (aiJson.matched_duplicate_id !== undefined) {
            matchedDuplicateId = aiJson.matched_duplicate_id;
          }
          if (typeof aiJson.duplicate_similarity === "number") {
            duplicateSimilarity = aiJson.duplicate_similarity;
          }
          if (aiJson.duplicate_reasoning) {
            duplicateReasoning = aiJson.duplicate_reasoning;
          }
        }
      } catch {
        // Fall back gracefully to deterministic priority engine
      }
    }

    const reportId = `CF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: CivicReport = {
      id: reportId,
      title: input.title,
      description: input.description,
      category: finalCategory,
      sub_area: input.sub_area,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      image_url: input.image_url || (input.image_base64 ? input.image_base64 : null),
      status: "AI_TRIAGED",
      assigned_department: null,
      dispatch_notes: null,
      priority_score: finalPriorityScore,
      priority_level: finalPriorityLevel,
      ai_summary: finalSummary,
      ai_explanation: finalExplanation,
      priority_factors: finalFactors,
      duplicate_of_id: isLikelyDuplicate ? matchedDuplicateId : null,
      duplicate_count: 1,
      duplicate_similarity: duplicateSimilarity,
      cluster_id: null,
      reporter_phone_masked: `STU-***-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const savedReport = await saveNewReport(newReport);

    const triageReceipt: TriageReceipt = {
      reportId: savedReport.id,
      category: savedReport.category,
      ai_summary: savedReport.ai_summary,
      priority_score: savedReport.priority_score,
      priority_level: savedReport.priority_level,
      priority_factors: savedReport.priority_factors,
      ai_explanation: savedReport.ai_explanation,
      is_likely_duplicate: isLikelyDuplicate,
      matched_duplicate_id: matchedDuplicateId,
      duplicate_similarity: duplicateSimilarity,
      duplicate_reasoning: duplicateReasoning,
      distance_meters: duplicateResult.distance_meters,
    };

    res.status(201).json({
      success: true,
      report: savedReport,
      triageReceipt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error processing campus report intake",
    });
  }
}
