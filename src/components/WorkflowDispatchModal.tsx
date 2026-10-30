import React, { useState } from "react";
import { CivicReport, ReportStatus, MunicipalDepartment } from "@/lib/validators";
import {
  X,
  Send,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
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
    report.assigned_department || "STORM_DRAINAGE"
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
      setErrorMsg(err.message || "Network error submitting workflow dispatch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-slate-700 bg-obsidian-900 p-6 shadow-2xl reticle-corner">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-tactical-cyan" />
            <h2 id="dispatch-modal-title" className="font-mono text-sm font-bold text-white tracking-wide">
              OPERATIONS DISPATCH & ASSIGNMENT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Ticket Brief */}
        <div className="mb-4 rounded-lg bg-obsidian-950 border border-slate-800 p-3 text-xs font-mono">
          <div className="flex items-center justify-between text-tactical-cyan font-bold mb-1">
            <span>#{report.id} • {report.category}</span>
            <span className="text-tactical-crimson">SCORE: {report.priority_score}/100</span>
          </div>
          <p className="text-slate-300 font-sans line-clamp-2">{report.title}</p>
          <div className="text-[11px] text-slate-400 mt-1">📍 {report.address}</div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2 rounded bg-tactical-crimson/20 border border-tactical-crimson/40 text-tactical-crimson text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          {/* Department Selection */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1">
              Assign Lead Municipal Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan"
            >
              <option value="STORM_DRAINAGE">STORM_DRAINAGE (Culvert, Gutter & Flood Response)</option>
              <option value="ROADS_DIV">ROADS_DIV (Asphalt, Pothole & Highway Division)</option>
              <option value="ELECTRICAL_GRID">ELECTRICAL_GRID (Transformers, Feeders & Streetlights)</option>
              <option value="SANITATION_SWM">SANITATION_SWM (Solid Waste & Dumpster Clearance)</option>
              <option value="WATER_BOARD">WATER_BOARD (Pipeline Mains & Potable Supply)</option>
            </select>
          </div>

          {/* Workflow Status Transition */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1">
              Transition Workflow Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReportStatus)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan"
            >
              <option value="AI_TRIAGED">AI_TRIAGED (Pending Dispatch)</option>
              <option value="ASSIGNED">ASSIGNED (Crews Alerted)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Crew On-Site / Hydro-Jetting)</option>
              <option value="RESOLVED">RESOLVED (Restoration Complete & Verified)</option>
            </select>
          </div>

          {/* Official Dispatch Notes */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1">
              Official Dispatch & Crew Notes
            </label>
            <textarea
              rows={3}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="e.g. Unit 4 dispatched with hydro-jetting vacuum truck. Priority access authorized through traffic control."
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan font-sans text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-tactical-cyan hover:bg-cyan-400 text-obsidian-950 font-bold transition flex items-center gap-1.5 shadow-cyan-glow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Dispatching..." : "Authorize Dispatch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
