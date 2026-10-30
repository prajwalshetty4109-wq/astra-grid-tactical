import React, { useState, useMemo } from "react";
import { CivicReport, CivicCategory, PriorityLevel, ReportStatus } from "@/lib/validators";
import {
  AlertTriangle,
  GitMerge,
  Shield,
  Clock,
  CheckCircle,
  Search,
  Filter,
  ArrowUpDown,
  Send,
  Eye,
  Activity,
  Layers,
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

  // Filter and sort reports
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
          const matchDesc = r.description.toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchAddr && !matchDesc) return false;
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
        return "bg-tactical-crimson/20 text-tactical-crimson border-tactical-crimson/50 font-bold";
      case "HIGH":
        return "bg-tactical-amber/20 text-tactical-amber border-tactical-amber/50 font-bold";
      case "MEDIUM":
        return "bg-tactical-cyan/20 text-tactical-cyan border-tactical-cyan/40";
      case "LOW":
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case "RESOLVED":
        return "bg-tactical-emerald/20 text-tactical-emerald border-tactical-emerald/40";
      case "IN_PROGRESS":
        return "bg-tactical-cyan/20 text-tactical-cyan border-tactical-cyan/40";
      case "ASSIGNED":
        return "bg-tactical-amber/20 text-tactical-amber border-tactical-amber/40";
      case "AI_TRIAGED":
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-800/90 bg-obsidian-900/95 p-4 shadow-xl flex flex-col gap-4">
      {/* Queue Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-tactical-cyan/15 border border-tactical-cyan/40 flex items-center justify-center">
            <Activity className="w-4 h-4 text-tactical-cyan" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-white tracking-wide">
              EXPLAINABLE TRIAGE & DISPATCH QUEUE
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Stage 2 & 4 • Priority Ranking, 4-Factor Breakdown & 1-Click Operations Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Showing:</span>
          <span className="text-white font-bold">{filteredReports.length}</span>
          <span className="text-slate-500">of {reports.length} Reports</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs font-mono">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ticket ID, street, keyword..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tactical-cyan text-xs"
            aria-label="Search reports"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan text-xs"
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
          className="px-2.5 py-1.5 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan text-xs"
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
          className="px-2.5 py-1.5 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-between text-xs transition"
          aria-label="Toggle sort order"
        >
          <span>Sort: {sortBy}</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-tactical-cyan" />
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
              className={`rounded-lg border p-4 transition cursor-pointer ${
                isSelected
                  ? "bg-slate-900 border-tactical-cyan shadow-cyan-glow"
                  : "bg-obsidian-950 border-slate-800/90 hover:border-slate-700 hover:bg-obsidian-900"
              }`}
            >
              {/* Top Row: IDs, Priority Score, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-tactical-cyan">
                    #{report.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {report.category}
                  </span>
                  {report.assigned_department && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-tactical-cyan border border-slate-700">
                      DEP: {report.assigned_department}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {/* Status Pill */}
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${getStatusBadgeClass(report.status)}`}>
                    {report.status}
                  </span>

                  {/* Priority Badge */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-bold ${getPriorityBadgeClass(
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
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {report.description}
              </p>

              {/* 4-Factor Explainable Breakdown Progress Bars */}
              <div className="bg-obsidian-900/90 rounded border border-slate-800 p-2.5 mb-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Explainable Priority Math Breakdown</span>
                  <span className="text-slate-300 font-bold">Total: {report.priority_score} pts</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  {/* Factor 1: Safety Risk (0-40) */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Safety (40)</span>
                      <span className="text-tactical-crimson font-bold">{factors.safetyRiskScore}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-tactical-crimson h-full rounded-full"
                        style={{ width: `${(factors.safetyRiskScore / 40) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 2: Cascade Impact (0-25) */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Cascade (25)</span>
                      <span className="text-tactical-amber font-bold">{factors.cascadeImpactScore}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-tactical-amber h-full rounded-full"
                        style={{ width: `${(factors.cascadeImpactScore / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 3: Duplicate Volume (0-20) */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Volume (20)</span>
                      <span className="text-tactical-cyan font-bold">{factors.duplicateVolumeScore}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-tactical-cyan h-full rounded-full"
                        style={{ width: `${(factors.duplicateVolumeScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 4: Vulnerability (0-15) */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Zone Sens. (15)</span>
                      <span className="text-tactical-emerald font-bold">{factors.vulnerabilityScore}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-tactical-emerald h-full rounded-full"
                        style={{ width: `${(factors.vulnerabilityScore / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Plain-Language AI Explanation */}
              <div className="text-[11px] text-slate-300 font-sans italic bg-obsidian-950/70 p-2 rounded border border-slate-800/80 mb-3">
                <span className="text-tactical-cyan font-mono font-semibold not-italic">AI Reasoning: </span>
                {report.ai_explanation}
              </div>

              {/* Duplicate Link Banner & Merge Action */}
              {report.duplicate_of_id ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-amber-950/20 border border-tactical-amber/40 text-xs font-mono text-tactical-amber mb-3">
                  <div className="flex items-center gap-1.5">
                    <GitMerge className="w-3.5 h-3.5 text-tactical-amber" />
                    <span>
                      Corroborating duplicate of ticket <strong>#{report.duplicate_of_id}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Similarity: {((report.duplicate_similarity || 0.8) * 100).toFixed(0)}%
                  </span>
                </div>
              ) : (
                report.duplicate_count && report.duplicate_count > 1 ? (
                  <div className="flex items-center gap-2 p-2 rounded bg-cyan-950/20 border border-cyan-800/50 text-xs font-mono text-tactical-cyan mb-3">
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      Primary Incident Ticket: Corroborated by <strong>{report.duplicate_count}</strong> citizen reports
                    </span>
                  </div>
                ) : null
              )}

              {/* Bottom Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="text-slate-400 text-[11px]">
                  📍 {report.address.split(",")[0]} • {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="flex items-center gap-2">
                  {/* Duplicate Merge button if matched */}
                  {report.duplicate_of_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMergeDuplicate(report.id, report.duplicate_of_id!);
                      }}
                      className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-tactical-amber/50 text-tactical-amber text-[11px] transition flex items-center gap-1"
                    >
                      <GitMerge className="w-3 h-3" />
                      <span>Merge Duplicate</span>
                    </button>
                  )}

                  {/* Dispatch / Update Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDispatchModal(report);
                    }}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-tactical-cyan hover:text-obsidian-950 border border-slate-700 hover:border-tactical-cyan text-slate-200 text-xs transition flex items-center gap-1.5 font-semibold"
                  >
                    <Send className="w-3 h-3" />
                    <span>Assign & Dispatch</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="p-8 text-center text-xs font-mono text-slate-500 rounded-lg border border-dashed border-slate-800">
            No reports match the current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
