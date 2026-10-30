import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import { GeospatialHotspotMap } from "@/components/GeospatialHotspotMap";
import { ClusterActionBriefPanel } from "@/components/ClusterActionBriefPanel";
import { ExplainableTriageQueue } from "@/components/ExplainableTriageQueue";
import { WorkflowDispatchModal } from "@/components/WorkflowDispatchModal";
import { CivicReport, HotspotCluster, ActionBriefResult } from "@/lib/validators";
import { INITIAL_SYNTHETIC_REPORTS } from "@/lib/syntheticReports";
import { detectGeographicClusters } from "@/lib/civicEngine";
import {
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  CheckCircle,
  GitMerge,
  Cpu,
  Clock,
  Radio,
} from "lucide-react";

export default function TacticalDeckPage() {
  const router = useRouter();
  const [reports, setReports] = useState<CivicReport[]>(INITIAL_SYNTHETIC_REPORTS);
  const [clusters, setClusters] = useState<HotspotCluster[]>(() =>
    detectGeographicClusters(INITIAL_SYNTHETIC_REPORTS)
  );
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster | null>(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchTargetReport, setDispatchTargetReport] = useState<CivicReport | null>(null);
  const [kpis, setKpis] = useState({
    totalReports: 36,
    criticalCount: 14,
    highCount: 5,
    resolvedCount: 2,
    inProgressCount: 1,
    duplicatesDetected: 16,
    activeHotspots: 3,
    avgPriorityScore: 74,
  });

  // Fetch live state from backend
  const fetchState = async () => {
    try {
      const res = await fetch("/api/reports/state");
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
        if (data.clusters) setClusters(data.clusters);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.warn("Using in-memory tactical baseline:", err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Handle URL query parameters for demo jumps
  useEffect(() => {
    if (router.query.cluster) {
      const target = clusters.find((c) => c.id === router.query.cluster);
      if (target) setSelectedCluster(target);
    }
    if (router.query.filter === "CRITICAL") {
      const firstCrit = reports.find((r) => r.priority_level === "CRITICAL");
      if (firstCrit) setSelectedReport(firstCrit);
    }
  }, [router.query, clusters, reports]);

  const handleSelectReport = (report: CivicReport) => {
    setSelectedReport(report);
  };

  const handleSelectCluster = (cluster: HotspotCluster) => {
    setSelectedCluster(cluster);
  };

  const handleOpenDispatch = (report: CivicReport) => {
    setDispatchTargetReport(report);
    setDispatchModalOpen(true);
  };

  const handleDispatchSuccess = (updatedReport: CivicReport) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
    );
    setSelectedReport(updatedReport);
    fetchState();
  };

  const handleMergeDuplicate = async (duplicateId: string, primaryId: string) => {
    if (confirm(`Merge duplicate complaint #${duplicateId} into primary incident #${primaryId}?`)) {
      try {
        const res = await fetch("/api/reports/workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: duplicateId,
            merge_duplicate_of_id: primaryId,
          }),
        });
        const data = await res.json();
        if (data.success) {
          fetchState();
        }
      } catch (err) {
        console.error("Duplicate merge failed:", err);
      }
    }
  };

  const handleJudgeDemoStep = (step: number) => {
    if (step === 1) {
      router.push("/report?demo=true");
    } else if (step === 2) {
      const topCrit = reports.find((r) => r.id === "AST-109") || reports[0];
      setSelectedReport(topCrit);
    } else if (step === 3) {
      const hotspot1 = clusters.find((c) => c.id === "HOTSPOT-1") || clusters[0];
      setSelectedCluster(hotspot1);
    } else if (step === 4) {
      const target = reports.find((r) => r.id === "AST-109") || reports[0];
      handleOpenDispatch(target);
    }
  };

  return (
    <>
      <Head>
        <title>Tactical Command Deck | ASTRA-Grid Tactical</title>
      </Head>

      <TacticalNavbar
        kpis={kpis}
        onResetData={fetchState}
        onTriggerDemoStep={handleJudgeDemoStep}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Top Operations KPI Ribbon */}
        <section aria-label="Operations Overview Metrics">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* KPI 1 */}
            <div className="rounded-xl border border-slate-800 bg-obsidian-900/90 p-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>TOTAL REPORTS</span>
                <Layers className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-white">{kpis.totalReports}</span>
                <span className="text-[10px] font-mono text-slate-400">across 6 sectors</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="rounded-xl border border-tactical-crimson/50 bg-crimson-950/20 p-3.5 flex flex-col justify-between shadow-crimson-glow">
              <div className="flex items-center justify-between text-tactical-crimson text-xs font-mono font-bold">
                <span>CRITICAL HAZARDS</span>
                <span className="w-2 h-2 rounded-full bg-tactical-crimson animate-ping" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-tactical-crimson">
                  {kpis.criticalCount}
                </span>
                <span className="text-[10px] font-mono text-slate-300">Life-Safety Risks</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="rounded-xl border border-tactical-amber/50 bg-amber-950/20 p-3.5 flex flex-col justify-between shadow-amber-glow">
              <div className="flex items-center justify-between text-tactical-amber text-xs font-mono font-bold">
                <span>HOTSPOT CLUSTERS</span>
                <Zap className="w-3.5 h-3.5 text-tactical-amber" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-tactical-amber">
                  {kpis.activeHotspots}
                </span>
                <span className="text-[10px] font-mono text-slate-300">Coupled Corridors</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="rounded-xl border border-slate-800 bg-obsidian-900/90 p-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-tactical-cyan text-xs font-mono font-bold">
                <span>DUPLICATES LINKED</span>
                <GitMerge className="w-3.5 h-3.5 text-tactical-cyan" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-tactical-cyan">
                  {kpis.duplicatesDetected}
                </span>
                <span className="text-[10px] font-mono text-slate-400">&lt;250m Haversine</span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="rounded-xl border border-slate-800 bg-obsidian-900/90 p-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-tactical-emerald text-xs font-mono font-bold">
                <span>DISPATCH / RESOLVED</span>
                <CheckCircle className="w-3.5 h-3.5 text-tactical-emerald" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-tactical-emerald">
                  {kpis.resolvedCount + kpis.inProgressCount}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Field Units Active</span>
              </div>
            </div>

            {/* KPI 6 */}
            <div className="rounded-xl border border-slate-800 bg-obsidian-900/90 p-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>AI TRIAGE ENGINE</span>
                <Cpu className="w-3.5 h-3.5 text-tactical-cyan animate-pulse" />
              </div>
              <div className="mt-2 flex flex-col">
                <span className="font-mono text-xs font-bold text-white">Gemini 2.5 Flash</span>
                <span className="text-[10px] font-mono text-tactical-cyan">&lt;650ms Latency SLA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Geospatial Hotspot Map (Reveal Stage) */}
        <section aria-label="Geospatial City Radar">
          <GeospatialHotspotMap
            reports={reports}
            clusters={clusters}
            selectedReport={selectedReport}
            selectedClusterId={selectedCluster?.id || null}
            onSelectReport={handleSelectReport}
            onSelectCluster={handleSelectCluster}
          />
        </section>

        {/* Section 2: Detected Clusters & AI Action Brief Panel */}
        <section aria-label="Detected Clusters and Action Briefs">
          <ClusterActionBriefPanel
            clusters={clusters}
            selectedCluster={selectedCluster}
            onSelectCluster={handleSelectCluster}
            onDispatchCluster={(cluster, brief) => {
              const primaryReport = cluster.reports[0];
              if (primaryReport) {
                handleOpenDispatch(primaryReport);
              }
            }}
          />
        </section>

        {/* Section 3: Explainable Priority Triage Queue (Understand & Act Stage) */}
        <section aria-label="Priority Triage and Operations Queue">
          <ExplainableTriageQueue
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={handleSelectReport}
            onOpenDispatchModal={handleOpenDispatch}
            onMergeDuplicate={handleMergeDuplicate}
          />
        </section>
      </main>

      {/* Dispatch Modal */}
      <WorkflowDispatchModal
        report={dispatchTargetReport}
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        onSuccess={handleDispatchSuccess}
      />
    </>
  );
}
