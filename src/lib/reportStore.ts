import { CivicReport } from "./validators";
import { INITIAL_SYNTHETIC_REPORTS } from "./syntheticReports";
import { getSupabaseClient } from "./supabase";

// Global singleton in-memory fallback store across serverless function re-uses
declare global {
  // eslint-disable-next-line no-var
  var __CAMPUS_REPORTS_STORE__: CivicReport[] | undefined;
}

function cloneInitialReports(): CivicReport[] {
  return JSON.parse(JSON.stringify(INITIAL_SYNTHETIC_REPORTS));
}

/**
 * Retrieves the global in-memory report store, initializing it with 36 baseline synthetic reports if empty.
 *
 * @returns CivicReport[] array of reports
 */
export function getInMemoryStore(): CivicReport[] {
  if (!global.__CAMPUS_REPORTS_STORE__ || global.__CAMPUS_REPORTS_STORE__.length === 0) {
    global.__CAMPUS_REPORTS_STORE__ = cloneInitialReports();
  }
  return global.__CAMPUS_REPORTS_STORE__;
}

/**
 * Fetches all active campus facility reports, querying Supabase if available or falling back to in-memory store.
 *
 * @returns Promise<CivicReport[]>
 */
export async function fetchAllReports(): Promise<CivicReport[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("civic_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          ...row,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          priority_score: Number(row.priority_score),
          duplicate_count: Number(row.duplicate_count || 1),
          duplicate_similarity: Number(row.duplicate_similarity || 0),
        })) as CivicReport[];
      }
    } catch {
      // Graceful fallback to in-memory store
    }
  }

  return getInMemoryStore();
}

/**
 * Saves a newly submitted campus facility report to the operational store.
 *
 * @param report CivicReport object to store
 * @returns Promise<CivicReport>
 */
export async function saveNewReport(report: CivicReport): Promise<CivicReport> {
  const store = getInMemoryStore();
  // Prepend to in-memory store
  store.unshift(report);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("civic_reports").insert([report]);
    } catch {
      // Graceful fallback to in-memory store
    }
  }

  return report;
}

/**
 * Updates the workflow state (status, assigned department, dispatch notes) of a campus report.
 *
 * @param reportId ID of report to update
 * @param updates Partial status and dispatch attributes
 * @returns Promise<CivicReport | null>
 */
export async function updateReportWorkflow(
  reportId: string,
  updates: {
    status?: CivicReport["status"];
    assigned_department?: string | null;
    dispatch_notes?: string | null;
    duplicate_of_id?: string | null;
  }
): Promise<CivicReport | null> {
  const store = getInMemoryStore();
  const index = store.findIndex((r) => r.id === reportId);
  if (index === -1) return null;

  const updated: CivicReport = {
    ...store[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  store[index] = updated;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from("civic_reports")
        .update({
          ...updates,
          updated_at: updated.updated_at,
        })
        .eq("id", reportId);
    } catch {
      // Supabase update skipped
    }
  }

  return updated;
}

/**
 * Merges a duplicate student report into a primary master ticket,
 * boosting the primary ticket's volume factor score and updating the duplicate record.
 *
 * @param duplicateReportId ID of child duplicate ticket
 * @param primaryReportId ID of master primary ticket
 * @returns Promise<{ updatedDuplicate: CivicReport; updatedPrimary: CivicReport } | null>
 */
export async function mergeDuplicateReports(
  duplicateReportId: string,
  primaryReportId: string
): Promise<{ updatedDuplicate: CivicReport; updatedPrimary: CivicReport } | null> {
  const store = getInMemoryStore();
  const dupIndex = store.findIndex((r) => r.id === duplicateReportId);
  const primaryIndex = store.findIndex((r) => r.id === primaryReportId);

  if (dupIndex === -1 || primaryIndex === -1) return null;

  const updatedPrimary: CivicReport = {
    ...store[primaryIndex],
    duplicate_count: (store[primaryIndex].duplicate_count || 1) + 1,
    priority_factors: {
      ...store[primaryIndex].priority_factors,
      duplicateVolumeScore: Math.min(20, store[primaryIndex].priority_factors.duplicateVolumeScore + 3),
    },
    priority_score: Math.min(100, store[primaryIndex].priority_score + 2),
    updated_at: new Date().toISOString(),
  };
  store[primaryIndex] = updatedPrimary;

  const updatedDuplicate: CivicReport = {
    ...store[dupIndex],
    duplicate_of_id: primaryReportId,
    status: "AI_TRIAGED",
    dispatch_notes: `Merged into primary incident ticket #${primaryReportId}. Corroborating field report verified.`,
    updated_at: new Date().toISOString(),
  };
  store[dupIndex] = updatedDuplicate;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from("civic_reports")
        .update({
          duplicate_count: updatedPrimary.duplicate_count,
          priority_factors: updatedPrimary.priority_factors,
          priority_score: updatedPrimary.priority_score,
          updated_at: updatedPrimary.updated_at,
        })
        .eq("id", primaryReportId);

      await supabase
        .from("civic_reports")
        .update({
          duplicate_of_id: primaryReportId,
          dispatch_notes: updatedDuplicate.dispatch_notes,
          updated_at: updatedDuplicate.updated_at,
        })
        .eq("id", duplicateReportId);
    } catch {
      // Supabase update skipped
    }
  }

  return { updatedDuplicate, updatedPrimary };
}

/**
 * Resets the operational reports dataset back to the 36 baseline synthetic reports.
 *
 * @returns Promise<void>
 */
export async function resetAllReports(): Promise<void> {
  global.__CAMPUS_REPORTS_STORE__ = cloneInitialReports();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("civic_reports").delete().neq("id", "placeholder");
      await supabase.from("civic_reports").insert(global.__CAMPUS_REPORTS_STORE__);
    } catch {
      // Supabase reset skipped
    }
  }
}
