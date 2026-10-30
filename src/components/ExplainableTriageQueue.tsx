import React, { useState, useMemo } from "react";
import { CivicReport, CivicCategory, PriorityLevel, ReportStatus } from "@/lib/validators";
import {
  AlertTriangle,
  GitMerge,
  Shield,
  Clock,
  CheckCircle,
  Search,
  ArrowUpDown,
  Send,
  Activity,
  Layers,
  Wrench,
} from "lucide-react";

interface ExplainableTriageQueueProps {
  reports: CivicReport[];
  selectedReport: CivicReport | null;
  onSelectReport: (report: CivicReport) => void;
  onOpenDispatchModal: (report: CivicReport) => void;
  onMergeDuplicate: (duplicateId: string, primaryId: string) => void;
}

export const ExplainableTriageQueue: React.FC<ExplainableTriageQueueProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  onOpenDispatchModal,
  onMergeDuplicate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"PRIORITY" | "DATE">("PRIORITY");

  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (priorityFilter !== "ALL" && r.priority_level !== priorityFilter) return false;
        if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = r.id.toLowerCase().includes(q);
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchAddr = r.address.toLowerCase().includes(q);
          const matchSub = r.sub_area.toLowerCase().includes(q);
          const matchDesc = r.description.toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchAddr && !matchSub && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "PRIORITY") {
          return b.priority_score - a.priority_score;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reports, statusFilter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  const getPriorityBadgeClass = (level: PriorityLevel) => {
    switch (level) {
      case "CRITICAL":
        return "bg-white text-black font-extrabold shadow-sm";
      case "HIGH":
        return "bg-neutral-200 text-black font-bold";
      case "MEDIUM":
        return "bg-neutral-800 text-white border border-white/20";
      case "LOW":
      default:
        return "bg-neutral-900 text-neutral-400 border border-white/10";
    }
  };

  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case "RESOLVED":
        return "bg-white/10 text-white border border-white/30";
      case "IN_PROGRESS":
        return "bg-neutral-800 text-white border border-white/20";
      case "ASSIGNED":
        return "bg-neutral-850 text-neutral-300 border border-white/15";
      case "AI_TRIAGED":
      default:
        return "bg-black text-neutral-400 border border-white/10";
    }
  };

  return (
    <div className="w-full rounded-xl border border-white/15 bg-neutral-950 p-5 shadow-3d-card flex flex-col gap-4">
      {/* Queue Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
            <Activity className="w-4 h-4 text-black" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-white tracking-wide">
              EXPLAINABLE TRIAGE & DISPATCH QUEUE
            </h2>
            <p className="text-[11px] text-neutral-400 font-sans">
              Stage 2 & 4 • Priority Ranking, 4-Factor Breakdown & 1-Click Crew Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-neutral-400">Showing:</span>
          <span className="text-white font-bold">{filteredReports.length}</span>
          <span className="text-neutral-500">of {reports.length} Reports</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs font-mono">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ticket ID, building, room..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white text-xs"
            aria-label="Search reports"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-neutral-200 focus:outline-none focus:border-white text-xs"
          aria-label="Filter by priority level"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical (&ge; 80)</option>
          <option value="HIGH">High (65–79)</option>
          <option value="MEDIUM">Medium (40–64)</option>
          <option value="LOW">Low (&lt; 40)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-neutral-200 focus:outline-none focus:border-white text-xs"
          aria-label="Filter by workflow status"
        >
          <option value="ALL">All Statuses</option>
          <option value="AI_TRIAGED">AI Triaged</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {/* Sort By Toggle */}
        <button
          onClick={() => setSortBy(sortBy === "PRIORITY" ? "DATE" : "PRIORITY")}
          className="px-2.5 py-1.5 rounded-lg bg-black border border-white/15 text-neutral-300 hover:text-white flex items-center justify-between text-xs transition"
          aria-label="Toggle sort order"
        >
          <span>Sort: {sortBy}</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

      {/* Triage Cards Feed */}
      <div className="flex flex-col gap-3 max-h-[720px] overflow-y-auto pr-1">
        {filteredReports.map((report) => {
          const isSelected = selectedReport?.id === report.id;
          const factors = report.priority_factors || {
            safetyRiskScore: 15,
            cascadeImpactScore: 10,
            duplicateVolumeScore: 5,
            vulnerabilityScore: 5,
          };

          return (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className={`rounded-xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? "bg-neutral-900 border-white shadow-3d-card-hover -translate-y-0.5"
                  : "bg-black border-white/10 hover:border-white/30 hover:bg-neutral-900/50"
              }`}
            >
              {/* Top Row: IDs, Priority Score, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">
                    #{report.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-white/10">
                    {report.category}
                  </span>
                  {report.assigned_department && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                      CREW: {report.assigned_department}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {/* Status Pill */}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStatusBadgeClass(report.status)}`}>
                    {report.status}
                  </span>

                  {/* Priority Badge */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs ${getPriorityBadgeClass(
                      report.priority_level
                    )}`}
                  >
                    <span>{report.priority_score}/100</span>
                    <span className="text-[10px]">[{report.priority_level}]</span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-semibold text-white mb-1">
                {report.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-3 font-sans">
                {report.description}
              </p>

              {/* 4-Factor Explainable Breakdown Progress Bars */}
              <div className="bg-neutral-900/90 rounded-lg border border-white/10 p-3 mb-3">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Explainable Priority Math Breakdown</span>
                  <span className="text-white font-bold">Total: {report.priority_score} pts</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10px] font-mono">
                  {/* Factor 1: Safety & Hazard Risk (0-40) */}
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-0.5">
                      <span>Safety (40)</span>
                      <span className="text-white font-bold">{factors.safetyRiskScore}</span>
                    </div>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="bg-white h-full rounded-full"
                        style={{ width: `${(factors.safetyRiskScore / 40) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 2: Academic Cascade (0-25) */}
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-0.5">
                      <span>Cascade (25)</span>
                      <span className="text-white font-bold">{factors.cascadeImpactScore}</span>
                    </div>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="bg-neutral-300 h-full rounded-full"
                        style={{ width: `${(factors.cascadeImpactScore / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 3: Student Corroboration Volume (0-20) */}
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-0.5">
                      <span>Volume (20)</span>
                      <span className="text-white font-bold">{factors.duplicateVolumeScore}</span>
                    </div>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="bg-neutral-400 h-full rounded-full"
                        style={{ width: `${(factors.duplicateVolumeScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 4: High-Occupancy Zone (0-15) */}
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-0.5">
                      <span>Zone Sens. (15)</span>
                      <span className="text-white font-bold">{factors.vulnerabilityScore}</span>
                    </div>
                    <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="bg-neutral-500 h-full rounded-full"
                        style={{ width: `${(factors.vulnerabilityScore / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Plain-Language AI Explanation */}
              <div className="text-[11px] text-neutral-300 font-sans italic bg-neutral-900/60 p-2.5 rounded-lg border border-white/10 mb-3">
                <span className="text-white font-mono font-bold not-italic">AI Reasoning: </span>
                {report.ai_explanation}
              </div>

              {/* Duplicate Link Banner & Merge Action */}
              {report.duplicate_of_id ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-neutral-900 border border-white/20 text-xs font-mono text-white mb-3">
                  <div className="flex items-center gap-1.5">
                    <GitMerge className="w-3.5 h-3.5 text-white" />
                    <span>
                      Corroborating duplicate of Ticket <strong>#{report.duplicate_of_id}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Similarity: {((report.duplicate_similarity || 0.85) * 100).toFixed(0)}%
                  </span>
                </div>
              ) : (
                report.duplicate_count && report.duplicate_count > 1 ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-white/15 text-xs font-mono text-white mb-3">
                    <Layers className="w-3.5 h-3.5 text-white" />
                    <span>
                      Primary Campus Incident: Corroborated by <strong>{report.duplicate_count}</strong> student reports
                    </span>
                  </div>
                ) : null
              )}

              {/* Bottom Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="text-neutral-400 text-[11px]">
                  📍 {report.sub_area} • {report.address} • {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="flex items-center gap-2">
                  {report.duplicate_of_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMergeDuplicate(report.id, report.duplicate_of_id!);
                      }}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/20 text-white text-[11px] transition flex items-center gap-1"
                    >
                      <GitMerge className="w-3 h-3" />
                      <span>Merge Duplicate</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDispatchModal(report);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition flex items-center gap-1.5 shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                  >
                    <Send className="w-3 h-3 text-black" />
                    <span>Assign & Dispatch</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="p-8 text-center text-xs font-mono text-neutral-500 rounded-lg border border-dashed border-white/15">
            No campus reports match the current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
