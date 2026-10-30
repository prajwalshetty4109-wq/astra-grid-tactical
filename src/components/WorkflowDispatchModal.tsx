import React, { useState } from "react";
import { CivicReport, ReportStatus, MaintenanceCrew } from "@/lib/validators";
import {
  X,
  Send,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
} from "lucide-react";

interface WorkflowDispatchModalProps {
  report: CivicReport | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedReport: CivicReport) => void;
}

export const WorkflowDispatchModal: React.FC<WorkflowDispatchModalProps> = ({
  report,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !report) return null;

  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [department, setDepartment] = useState<string>(
    report.assigned_department || "PLUMBING_OPS"
  );
  const [dispatchNotes, setDispatchNotes] = useState<string>(
    report.dispatch_notes || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/reports/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report.id,
          status,
          assigned_department: department,
          dispatch_notes: dispatchNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        onSuccess(data.report);
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to update workflow state");
      }
    } catch (err: any) {
      console.error("Workflow submission error:", err);
      setErrorMsg(err.message || "Network error submitting crew dispatch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-neutral-950 p-6 shadow-3d-card reticle-corner-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-white" />
            <h2 id="dispatch-modal-title" className="font-mono text-sm font-bold text-white tracking-wide">
              FACILITY CREW DISPATCH & ASSIGNMENT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-neutral-900 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Incident Brief */}
        <div className="mb-4 rounded-xl bg-neutral-900 border border-white/10 p-3.5 text-xs font-mono shadow-3d-subtle">
          <div className="flex items-center justify-between text-white font-bold mb-1">
            <span>#{report.id} • {report.category}</span>
            <span className="bg-white text-black px-1.5 py-0.2 rounded text-[10px]">
              SCORE: {report.priority_score}/100
            </span>
          </div>
          <p className="text-neutral-300 font-sans line-clamp-2">{report.title}</p>
          <div className="text-[11px] text-neutral-400 mt-1">
            📍 {report.sub_area} • {report.address}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          {/* Crew Selection */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1.5 font-semibold">
              Assign Campus Maintenance Team
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white focus:outline-none focus:border-white text-xs"
            >
              <option value="PLUMBING_OPS">PLUMBING_OPS (Risers, Pipe Leaks & Chilled Water)</option>
              <option value="ELECTRICAL_ENG">ELECTRICAL_ENG (Lab Power, Breakers & High Voltage)</option>
              <option value="IT_HELPDESK">IT_HELPDESK (Wi-Fi APs, Switches & Classroom AV)</option>
              <option value="HVAC_TECH">HVAC_TECH (Cooling Towers, Chillers & Lab Ventilation)</option>
              <option value="SANITATION_CREW">SANITATION_CREW (Chute Clearance, Waste & Disinfection)</option>
              <option value="FACILITY_GENERAL">FACILITY_GENERAL (Carpentry, Doors, Locks & Furniture)</option>
            </select>
          </div>

          {/* Workflow Status Transition */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1.5 font-semibold">
              Transition Maintenance Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReportStatus)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white focus:outline-none focus:border-white text-xs"
            >
              <option value="AI_TRIAGED">AI_TRIAGED (Pending Crew Dispatch)</option>
              <option value="ASSIGNED">ASSIGNED (Technician Alerted)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Technician On-Site / Repair Underway)</option>
              <option value="RESOLVED">RESOLVED (Restoration Verified & Signed Off)</option>
            </select>
          </div>

          {/* Dispatch Notes */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1.5 font-semibold">
              Official Technician & Work Order Notes
            </label>
            <textarea
              rows={3}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="e.g. Lead plumber dispatched with pipe freezing unit and wet vacuum. Sub-panel 3B breaker isolated."
              className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white focus:outline-none focus:border-white font-sans text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold transition flex items-center gap-1.5 shadow-[0_4px_14px_rgba(255,255,255,0.25)]"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>{isSubmitting ? "Dispatching..." : "Authorize Crew Dispatch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
