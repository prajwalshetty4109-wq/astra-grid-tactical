import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import { GeospatialHotspotMap } from "@/components/GeospatialHotspotMap";
import { ClusterActionBriefPanel } from "@/components/ClusterActionBriefPanel";
import { ExplainableTriageQueue } from "@/components/ExplainableTriageQueue";
import { WorkflowDispatchModal } from "@/components/WorkflowDispatchModal";
import { CivicReport, HotspotCluster } from "@/lib/validators";
import { INITIAL_SYNTHETIC_REPORTS } from "@/lib/syntheticReports";
import { detectGeographicClusters } from "@/lib/civicEngine";
import {
  Building2,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  CheckCircle,
  GitMerge,
  Cpu,
  Wrench,
} from "lucide-react";

export default function CampusDeckPage() {
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
      console.warn("Using in-memory campus baseline:", err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

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
    if (confirm(`Merge duplicate campus ticket #${duplicateId} into primary incident #${primaryId}?`)) {
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
      const topCrit = reports.find((r) => r.id === "CF-104") || reports[0];
      setSelectedReport(topCrit);
    } else if (step === 3) {
      const hotspot1 = clusters.find((c) => c.id === "HOTSPOT-1") || clusters[0];
      setSelectedCluster(hotspot1);
    } else if (step === 4) {
      const target = reports.find((r) => r.id === "CF-104") || reports[0];
      handleOpenDispatch(target);
    }
  };

  return (
    <>
      <Head>
        <title>Campus Operations Deck | CampusFix</title>
      </Head>

      <TacticalNavbar
        kpis={kpis}
        onResetData={fetchState}
        onTriggerDemoStep={handleJudgeDemoStep}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Top Operations 3D KPI Ribbon */}
        <section aria-label="Campus Operations Metrics">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* KPI 1 */}
            <div className="rounded-xl border border-white/10 bg-neutral-950 p-4 flex flex-col justify-between shadow-3d-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono font-medium">
                <span>TOTAL TICKETS</span>
                <Layers className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-white">{kpis.totalReports}</span>
                <span className="text-[10px] font-mono text-neutral-500">6 Buildings</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="rounded-xl border border-white/30 bg-neutral-900 p-4 flex flex-col justify-between shadow-3d-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between text-white text-xs font-mono font-bold">
                <span>CRITICAL HAZARDS</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-extrabold text-white">
                  {kpis.criticalCount}
                </span>
                <span className="text-[10px] font-mono text-neutral-300">Lab/Safety Risks</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="rounded-xl border border-white/15 bg-neutral-950 p-4 flex flex-col justify-between shadow-3d-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between text-neutral-300 text-xs font-mono font-bold">
                <span>BUILDING CLUSTERS</span>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-white">
                  {kpis.activeHotspots}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Coupled Wings</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="rounded-xl border border-white/15 bg-neutral-950 p-4 flex flex-col justify-between shadow-3d-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between text-neutral-300 text-xs font-mono font-bold">
                <span>DUPLICATES LINKED</span>
                <GitMerge className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-white">
                  {kpis.duplicatesDetected}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">&lt;250m Haversine</span>
              </div>
            </div>

            {/* KPI 5 */}
            <div className="rounded-xl border border-white/15 bg-neutral-950 p-4 flex flex-col justify-between shadow-3d-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between text-neutral-300 text-xs font-mono font-bold">
                <span>CREW DISPATCHED</span>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-white">
                  {kpis.resolvedCount + kpis.inProgressCount}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Work Orders Active</span>
              </div>
            </div>

            {/* KPI 6 */}
            <div className="rounded-xl border border-white/15 bg-neutral-950 p-4 flex flex-col justify-between shadow-3d-card hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono">
                <span>AI TRIAGE ENGINE</span>
                <Cpu className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <div className="mt-2 flex flex-col">
                <span className="font-mono text-xs font-bold text-white">Gemini 2.5 Flash</span>
                <span className="text-[10px] font-mono text-neutral-400">&lt;650ms Latency SLA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Geospatial 3D Campus Blueprint Map */}
        <section aria-label="3D Campus Map Blueprint">
          <GeospatialHotspotMap
            reports={reports}
            clusters={clusters}
            selectedReport={selectedReport}
            selectedClusterId={selectedCluster?.id || null}
            onSelectReport={handleSelectReport}
            onSelectCluster={handleSelectCluster}
          />
        </section>

        {/* Section 2: Detected Building Clusters & Maintenance Briefs */}
        <section aria-label="Multi-Issue Building Clusters">
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

        {/* Section 3: Explainable Triage Queue */}
        <section aria-label="Facility Crew Operations Queue">
          <ExplainableTriageQueue
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={handleSelectReport}
            onOpenDispatchModal={handleOpenDispatch}
            onMergeDuplicate={handleMergeDuplicate}
          />
        </section>
      </main>

      {/* Crew Dispatch Modal */}
      <WorkflowDispatchModal
        report={dispatchTargetReport}
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        onSuccess={handleDispatchSuccess}
      />
    </>
  );
}
