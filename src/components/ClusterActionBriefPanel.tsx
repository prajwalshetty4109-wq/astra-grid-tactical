import React, { useState } from "react";
import { HotspotCluster, ActionBriefResult, CivicReport } from "@/lib/validators";
import {
  Sparkles,
  Zap,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Send,
  CheckCircle2,
  Cpu,
  Building2,
} from "lucide-react";

interface ClusterActionBriefPanelProps {
  clusters: HotspotCluster[];
  selectedCluster: HotspotCluster | null;
  onSelectCluster: (cluster: HotspotCluster) => void;
  onDispatchCluster?: (cluster: HotspotCluster, brief: ActionBriefResult) => void;
}

export const ClusterActionBriefPanel: React.FC<ClusterActionBriefPanelProps> = ({
  clusters,
  selectedCluster,
  onSelectCluster,
  onDispatchCluster,
}) => {
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [actionBriefs, setActionBriefs] = useState<Record<string, ActionBriefResult>>({});
  const [briefError, setBriefError] = useState<string | null>(null);

  const activeCluster = selectedCluster || clusters[0] || null;

  const handleGenerateBrief = async (cluster: HotspotCluster) => {
    setLoadingBrief(true);
    setBriefError(null);

    try {
      const res = await fetch("/api/ai/action-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clusterId: cluster.id,
          clusterTitle: cluster.title,
          reportIds: cluster.reports.map((r) => r.id),
        }),
      });

      const data = await res.json();
      if (data.success && data.brief) {
        setActionBriefs((prev) => ({
          ...prev,
          [cluster.id]: data.brief,
        }));
      } else {
        setBriefError(data.error || "Failed to generate maintenance action brief");
      }
    } catch (err: any) {
      console.error("Action brief fetch failed:", err);
      setBriefError(err.message || "Network error generating maintenance brief");
    } finally {
      setLoadingBrief(false);
    }
  };

  const currentBrief = activeCluster ? actionBriefs[activeCluster.id] : null;

  return (
    <div className="w-full rounded-xl border border-white/15 bg-neutral-950 p-5 shadow-3d-card flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-white tracking-wide">
              MULTI-ISSUE BUILDING CLUSTERS & AI BRIEFS
            </h2>
            <p className="text-[11px] text-neutral-400 font-sans">
              Stage 3 (Reveal) • Spatial Corridor Detection & 60s Gemini 2.5 Flash Synthesis
            </p>
          </div>
        </div>

        <span className="font-mono text-xs text-white bg-neutral-900 px-2.5 py-1 rounded-md border border-white/15">
          {clusters.length} Active Corridors
        </span>
      </div>

      {/* Building Cluster Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {clusters.map((cluster) => {
          const isSelected = activeCluster?.id === cluster.id;
          const hasBrief = Boolean(actionBriefs[cluster.id]);

          return (
            <button
              key={cluster.id}
              onClick={() => onSelectCluster(cluster)}
              className={`text-left px-3.5 py-2 rounded-lg border text-xs font-mono transition flex items-center gap-2 ${
                isSelected
                  ? "bg-white text-black border-white font-bold shadow-[0_4px_14px_rgba(255,255,255,0.2)]"
                  : "bg-neutral-900 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSelected ? "bg-black" : cluster.criticalCount > 0 ? "bg-white animate-ping" : "bg-neutral-500"
                }`}
              />
              <span>{cluster.id}</span>
              <span className="text-[11px] opacity-80">
                {cluster.primaryCorridor.split(" ")[0]}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                isSelected ? "bg-neutral-200 text-black border-neutral-300" : "bg-black text-neutral-400 border-white/10"
              }`}>
                {cluster.reportCount} rpts
              </span>
              {hasBrief && (
                <span className={`text-[10px] font-bold ${isSelected ? "text-black" : "text-white"}`}>
                  • Ready
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Cluster Details */}
      {activeCluster ? (
        <div className="rounded-xl bg-neutral-900/90 border border-white/15 p-4 flex flex-col gap-3 shadow-3d-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{activeCluster.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-bold">
                  RISK: {activeCluster.compositeRiskScore}/100
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                Centroid: {activeCluster.centroid.latitude.toFixed(4)}°N,{" "}
                {activeCluster.centroid.longitude.toFixed(4)}°E • Radius: ~{activeCluster.radiusMeters}m
              </p>
            </div>

            {/* AI Action Brief Generator Button */}
            <button
              onClick={() => handleGenerateBrief(activeCluster)}
              disabled={loadingBrief}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white text-black font-mono text-xs font-bold tracking-wider hover:bg-neutral-200 transition shadow-[0_4px_14px_rgba(255,255,255,0.25)]"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loadingBrief ? "animate-spin" : ""}`} />
              <span>{loadingBrief ? "Synthesizing with Gemini..." : "Generate 60s Maintenance Brief"}</span>
            </button>
          </div>

          {/* Coupled Facility Issues */}
          <div>
            <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Coupled Building Infrastructure Failures (Interconnected Problems):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeCluster.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-md bg-black border border-white/15 text-neutral-200 text-[11px] font-mono font-medium"
                >
                  {cat.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Render Action Brief Result */}
          {currentBrief ? (
            <div className="mt-2 rounded-xl border border-white/20 bg-black/95 p-4 flex flex-col gap-3 shadow-3d-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-white" />
                  Gemini 2.5 Flash • 60-Second Executive Maintenance Brief
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-white/10">
                  Decision Ready
                </span>
              </div>

              {/* Root Cause Diagnosis */}
              <div className="bg-neutral-900/90 p-3 rounded-lg border border-white/10">
                <div className="text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1">
                  Root Cause Diagnosis:
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                  {currentBrief.root_cause_diagnosis}
                </p>
              </div>

              {/* Ordered Fix Sequence */}
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-white" />
                  Ordered Facility Crew Sequence:
                </div>
                <div className="flex flex-col gap-2">
                  {currentBrief.recommended_sequence.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-neutral-900 border border-white/10 text-xs font-mono text-neutral-200"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Crew & Affected Population */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Lead Crew: <strong className="text-white">{currentBrief.lead_department}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Users className="w-3.5 h-3.5 text-white" />
                  <span>Impacted: <strong className="text-white">{currentBrief.estimated_citizens_impacted}</strong></span>
                </div>
              </div>

              {/* Confidence & Authorization */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px]">
                <p className="text-neutral-400 italic">
                  Note: {currentBrief.confidence_note}
                </p>
                {onDispatchCluster && (
                  <button
                    onClick={() => onDispatchCluster(activeCluster, currentBrief)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-mono text-xs font-bold hover:bg-neutral-200 transition shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                  >
                    <Send className="w-3 h-3" />
                    <span>Authorize Crew Dispatch</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-white/15 text-center font-mono text-xs text-neutral-500">
              Click &quot;Generate 60s Maintenance Brief&quot; to synthesize all {activeCluster.reportCount} reports in this building into an inter-departmental action order via Gemini 2.5 Flash.
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-xs font-mono text-neutral-500">
          No active building clusters identified.
        </div>
      )}
    </div>
  );
};
