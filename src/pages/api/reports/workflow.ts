import type { NextApiRequest, NextApiResponse } from "next";
import { WorkflowUpdateInputSchema } from "@/lib/validators";
import { updateReportWorkflow, mergeDuplicateReports } from "@/lib/reportStore";
import { applySecurityGuard, deepSanitize } from "@/lib/security";

/**
 * Endpoint for technician work order dispatch, status advancement, and duplicate ticket merging.
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

  const sanitizedBody = deepSanitize(req.body);
  const parseResult = WorkflowUpdateInputSchema.safeParse(sanitizedBody);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: "Invalid workflow update parameters",
      details: parseResult.error.format(),
    });
    return;
  }

  const {
    reportId,
    status,
    assigned_department,
    dispatch_notes,
    merge_duplicate_of_id,
  } = parseResult.data;

  try {
    // If merging duplicate
    if (merge_duplicate_of_id) {
      const mergeResult = await mergeDuplicateReports(reportId, merge_duplicate_of_id);
      if (!mergeResult) {
        res.status(404).json({
          success: false,
          error: "One or both reports not found for duplicate merge",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Report #${reportId} merged into primary #${merge_duplicate_of_id}`,
        updatedDuplicate: mergeResult.updatedDuplicate,
        updatedPrimary: mergeResult.updatedPrimary,
      });
      return;
    }

    // Standard workflow status / dispatch update
    const updated = await updateReportWorkflow(reportId, {
      status,
      assigned_department,
      dispatch_notes,
    });

    if (!updated) {
      res.status(404).json({
        success: false,
        error: `Report with ID #${reportId} not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      report: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to apply workflow dispatch update",
    });
  }
}
