import { z } from "zod";

export const CivicCategorySchema = z.enum([
  "IT_INFRA",
  "PLUMBING",
  "ELECTRICAL",
  "HVAC",
  "SANITATION",
  "FURNITURE",
]);

export type CivicCategory = z.infer<typeof CivicCategorySchema>;

export const ReportStatusSchema = z.enum([
  "SUBMITTED",
  "AI_TRIAGED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
]);

export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const PriorityLevelSchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
export type PriorityLevel = z.infer<typeof PriorityLevelSchema>;

export const MaintenanceCrewSchema = z.enum([
  "IT_HELPDESK",
  "PLUMBING_OPS",
  "ELECTRICAL_ENG",
  "HVAC_TECH",
  "SANITATION_CREW",
  "FACILITY_GENERAL",
]);

export type MaintenanceCrew = z.infer<typeof MaintenanceCrewSchema>;

export const PriorityFactorsSchema = z.object({
  safetyRiskScore: z.number().min(0).max(40),
  cascadeImpactScore: z.number().min(0).max(25),
  duplicateVolumeScore: z.number().min(0).max(20),
  vulnerabilityScore: z.number().min(0).max(15),
});

export type PriorityFactors = z.infer<typeof PriorityFactorsSchema>;

export const CivicReportSchema = z.object({
  id: z.string(),
  title: z.string().min(3),
  description: z.string().min(5),
  category: CivicCategorySchema,
  sub_area: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  image_url: z.string().nullable().optional(),
  status: ReportStatusSchema,
  assigned_department: z.string().nullable().optional(),
  dispatch_notes: z.string().nullable().optional(),
  priority_score: z.number().min(0).max(100),
  priority_level: PriorityLevelSchema,
  ai_summary: z.string(),
  ai_explanation: z.string(),
  priority_factors: PriorityFactorsSchema,
  duplicate_of_id: z.string().nullable().optional(),
  duplicate_count: z.number().default(1),
  duplicate_similarity: z.number().default(0),
  cluster_id: z.string().nullable().optional(),
  reporter_phone_masked: z.string().default("STU-***-4821"),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CivicReport = z.infer<typeof CivicReportSchema>;

export const SubmitReportInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(8, "Description must be at least 8 characters"),
  category: CivicCategorySchema.optional(),
  sub_area: z.string().min(2, "Building or Wing is required"),
  address: z.string().min(3, "Room or Floor location is required"),
  latitude: z.number({ required_error: "Latitude coordinate is required" }),
  longitude: z.number({ required_error: "Longitude coordinate is required" }),
  image_url: z.string().optional().nullable(),
  image_base64: z.string().optional().nullable(),
});

export type SubmitReportInput = z.infer<typeof SubmitReportInputSchema>;

export const WorkflowUpdateInputSchema = z.object({
  reportId: z.string(),
  status: ReportStatusSchema.optional(),
  assigned_department: z.string().optional().nullable(),
  dispatch_notes: z.string().optional().nullable(),
  merge_duplicate_of_id: z.string().optional().nullable(),
});

export type WorkflowUpdateInput = z.infer<typeof WorkflowUpdateInputSchema>;

export const ActionBriefInputSchema = z.object({
  clusterId: z.string(),
  clusterTitle: z.string().optional(),
  reportIds: z.array(z.string()).min(1),
});

export type ActionBriefInput = z.infer<typeof ActionBriefInputSchema>;

export interface ActionBriefResult {
  cluster_title: string;
  root_cause_diagnosis: string;
  recommended_sequence: string[];
  lead_department: string;
  estimated_citizens_impacted: string;
  confidence_note: string;
}

export interface HotspotCluster {
  id: string;
  title: string;
  centroid: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
  reportCount: number;
  criticalCount: number;
  categories: CivicCategory[];
  compositeRiskScore: number;
  reports: CivicReport[];
  primaryCorridor: string;
}
