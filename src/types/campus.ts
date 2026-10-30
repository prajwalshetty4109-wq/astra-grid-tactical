import {
  CivicCategory,
  CivicReport,
  HotspotCluster,
  PriorityFactors,
  PriorityLevel,
  ReportStatus,
} from "@/lib/validators";

/**
 * Triage receipt returned to citizen/student upon report intake.
 */
export interface TriageReceipt {
  reportId: string;
  category: CivicCategory;
  ai_summary: string;
  priority_score: number;
  priority_level: PriorityLevel;
  priority_factors: PriorityFactors;
  ai_explanation: string;
  is_likely_duplicate: boolean;
  matched_duplicate_id: string | null;
  duplicate_similarity: number;
  duplicate_reasoning: string;
  distance_meters?: number;
}

/**
 * Key performance indicators displayed on the tactical dashboard.
 */
export interface CampusKpis {
  totalReports: number;
  criticalCount: number;
  highCount: number;
  resolvedCount: number;
  inProgressCount: number;
  duplicatesDetected: number;
  activeHotspots: number;
  avgPriorityScore: number;
}

/**
 * Duplicate chain link group for grouping child tickets under a primary master.
 */
export interface DuplicateChain {
  parentId: string;
  duplicates: CivicReport[];
  count: number;
}

/**
 * Response structure returned by /api/reports/state.
 */
export interface StateApiResponse {
  success: boolean;
  timestamp: string;
  reports: CivicReport[];
  clusters: HotspotCluster[];
  duplicateChains: DuplicateChain[];
  kpis: CampusKpis;
}

/**
 * Multimodal input payload for Gemini model content generation.
 */
export interface GeminiTextPart {
  text: string;
}

export interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type GeminiContentPart = GeminiTextPart | GeminiInlineDataPart;

/**
 * Structured workflow dispatch modal form state.
 */
export interface WorkflowDispatchFormState {
  status: ReportStatus;
  department: string;
  dispatchNotes: string;
}

