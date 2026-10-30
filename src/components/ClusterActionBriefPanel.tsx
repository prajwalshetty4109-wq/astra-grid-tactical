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
        setBriefError(data.error || "Failed to generate AI action brief");
      }
    } catch (err: any) {
      console.error("Action brief fetch failed:", err);
      setBriefError(err.message || "Network error generating action brief");
    } finally {
      setLoadingBrief(false);
    }
  };

  const currentBrief = activeCluster ? actionBriefs[activeCluster.id] : null;

  return (
    <div className="w-full rounded-xl border border-slate-800/90 bg-obsidian-900/95 p-4 shadow-xl flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-tactical-amber/15 border border-tactical-amber/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-tactical-amber" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-white tracking-wide">
              MULTI-HAZARD CLUSTERS & AI ACTION BRIEFS
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Stage 3 (Reveal) • Algorithmic Corridor Detection & 60s Gemini Synthesis
            </p>
          </div>
        </div>

        <span className="font-mono text-xs text-tactical-cyan bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          {clusters.length} Active Corridors
        </span>
      </div>

      {/* Cluster Corridor Selection Pills */}
      <div className="flex flex-wrap gap-2">
        {clusters.map((cluster) => {
          const isSelected = activeCluster?.id === cluster.id;
          const hasBrief = Boolean(actionBriefs[cluster.id]);

          return (
            <button
              key={cluster.id}
              onClick={() => onSelectCluster(cluster)}
              className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition flex items-center gap-2 ${
                isSelected
                  ? "bg-slate-800 text-white border-tactical-amber shadow-amber-glow"
                  : "bg-obsidian-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  cluster.criticalCount > 0 ? "bg-tactical-crimson animate-ping" : "bg-tactical-amber"
                }`}
              />
              <span className="font-bold">{cluster.id}</span>
              <span className="text-[11px] text-slate-300">
                {cluster.primaryCorridor.split(":")[0]}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                {cluster.reportCount} rpts
              </span>
              {hasBrief && (
                <span className="text-[10px] text-tactical-cyan font-bold">• Brief Ready</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Cluster Details */}
      {activeCluster ? (
        <div className="rounded-lg bg-obsidian-950 border border-slate-800/90 p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{activeCluster.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-crimson/20 text-tactical-crimson border border-tactical-crimson/40 font-semibold">
                  RISK SCORE: {activeCluster.compositeRiskScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Centroid: {activeCluster.centroid.latitude.toFixed(4)}°N,{" "}
                {activeCluster.centroid.longitude.toFixed(4)}°E • Radius: ~{activeCluster.radiusMeters}m
              </p>
            </div>

            {/* AI Action Brief Trigger Button */}
            <button
              onClick={() => handleGenerateBrief(activeCluster)}
              disabled={loadingBrief}
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-tactical-cyan/20 to-cyan-500/30 border border-tactical-cyan text-tactical-cyan hover:bg-tactical-cyan hover:text-obsidian-950 font-mono text-xs font-semibold tracking-wider transition shadow-cyan-glow"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loadingBrief ? "animate-spin" : ""}`} />
              <span>{loadingBrief ? "Synthesizing with Gemini..." : "Generate 60s Executive Action Brief"}</span>
            </button>
          </div>

          {/* Interconnected Categories in this Corridor */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Coupled Infrastructure Failures (Interconnected Problems):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeCluster.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono"
                >
                  {cat.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Render Action Brief Result */}
          {currentBrief ? (
            <div className="mt-2 rounded-lg border border-cyan-800/60 bg-slate-900/90 p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-tactical-cyan font-mono text-xs font-bold uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-tactical-cyan" />
                  Gemini 2.5 Flash • 60-Second Executive Action Brief
                </div>
                <span className="text-[10px] font-mono text-slate-400">Decision Ready</span>
              </div>

              {/* Root Cause Diagnosis */}
              <div className="bg-obsidian-950/80 p-3 rounded border border-slate-800">
                <div className="text-[10px] font-mono text-tactical-amber uppercase font-semibold mb-1">
                  Root Cause Diagnosis:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {currentBrief.root_cause_diagnosis}
                </p>
              </div>

              {/* Ordered Fix Sequence */}
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-tactical-cyan" />
                  Ordered Municipal Action Sequence:
                </div>
                <div className="flex flex-col gap-2">
                  {currentBrief.recommended_sequence.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-obsidian-900 border border-slate-800/80 text-xs font-mono text-slate-200"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Department & Impact Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-tactical-emerald" />
                  <span>Lead: <strong className="text-white">{currentBrief.lead_department}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-tactical-cyan" />
                  <span>Impact: <strong className="text-white">{currentBrief.estimated_citizens_impacted}</strong></span>
                </div>
              </div>

              {/* Confidence Note & Action Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-[11px]">
                <p className="text-slate-400 italic">
                  Note: {currentBrief.confidence_note}
                </p>
                {onDispatchCluster && (
                  <button
                    onClick={() => onDispatchCluster(activeCluster, currentBrief)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-tactical-emerald/20 hover:bg-tactical-emerald/30 border border-tactical-emerald text-tactical-emerald font-mono text-xs font-semibold transition"
                  >
                    <Send className="w-3 h-3" />
                    <span>Authorize Joint Dispatch</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded border border-dashed border-slate-800 text-center font-mono text-xs text-slate-500">
              Click &quot;Generate 60s Executive Action Brief&quot; to synthesize all {activeCluster.reportCount} reports in this cluster into an immediate inter-departmental action order via Gemini 2.5 Flash.
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-xs font-mono text-slate-500">
          No active hotspot corridors identified.
        </div>
      )}
    </div>
  );
};
