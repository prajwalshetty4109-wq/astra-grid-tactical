import type { NextApiRequest, NextApiResponse } from "next";
import { WorkflowUpdateInputSchema } from "@/lib/validators";
import { updateReportWorkflow, mergeDuplicateReports } from "@/lib/reportStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parseResult = WorkflowUpdateInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid workflow update parameters",
      details: parseResult.error.format(),
    });
  }

  const { reportId, status, assigned_department, dispatch_notes, merge_duplicate_of_id } =
    parseResult.data;

  try {
    // If merging duplicate
    if (merge_duplicate_of_id) {
      const mergeResult = await mergeDuplicateReports(reportId, merge_duplicate_of_id);
      if (!mergeResult) {
        return res.status(404).json({
          success: false,
          error: "One or both reports not found for duplicate merge",
        });
      }
      return res.status(200).json({
        success: true,
        message: `Report #${reportId} merged into primary #${merge_duplicate_of_id}`,
        updatedDuplicate: mergeResult.updatedDuplicate,
        updatedPrimary: mergeResult.updatedPrimary,
      });
    }

    // Standard workflow status / dispatch update
    const updated = await updateReportWorkflow(reportId, {
      status,
      assigned_department,
      dispatch_notes,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Report with ID #${reportId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      report: updated,
    });
  } catch (error) {
    console.error("Workflow update failure:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to apply workflow dispatch update",
    });
  }
}

