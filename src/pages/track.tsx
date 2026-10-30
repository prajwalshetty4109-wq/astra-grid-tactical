import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import { CivicReport } from "@/lib/validators";
import { INITIAL_SYNTHETIC_REPORTS } from "@/lib/syntheticReports";
import {
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Truck,
  Layers,
  Sparkles,
  GitMerge,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export default function TrackPage() {
  const router = useRouter();
  const [reportIdInput, setReportIdInput] = useState("AST-109");
  const [currentReport, setCurrentReport] = useState<CivicReport | null>(null);
  const [reports, setReports] = useState<CivicReport[]>(INITIAL_SYNTHETIC_REPORTS);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load state from backend
  useEffect(() => {
    fetch("/api/reports/state")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reports) {
          setReports(data.reports);
        }
      })
      .catch((err) => console.warn("Track state fallback:", err));
  }, []);

  // Update lookup based on URL parameter or default
  useEffect(() => {
    const id = (router.query.id as string) || "AST-109";
    setReportIdInput(id);
    const found = reports.find((r) => r.id.toLowerCase() === id.toLowerCase());
    if (found) {
      setCurrentReport(found);
      setSearchError(null);
    } else {
      setCurrentReport(reports[0] || null);
    }
  }, [router.query.id, reports]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = reportIdInput.trim().toUpperCase();
    const found = reports.find((r) => r.id.toUpperCase() === query);
    if (found) {
      setCurrentReport(found);
      setSearchError(null);
      router.push(`/track?id=${found.id}`, undefined, { shallow: true });
    } else {
      setSearchError(`Report ticket #${query} not found in operational database.`);
    }
  };

  const sampleTickets = ["AST-109", "AST-101", "AST-201", "AST-301", "AST-401", "AST-504"];

  const steps = [
    { key: "SUBMITTED", label: "Citizen Intake Captured", desc: "Logged via mobile/web portal" },
    { key: "AI_TRIAGED", label: "Gemini 2.5 Flash Triaged", desc: "Prioritized & checked for duplicates" },
    { key: "ASSIGNED", label: "Department Assigned", desc: "Assigned to specialized response unit" },
    { key: "IN_PROGRESS", label: "Field Operations Active", desc: "Crews on-site conducting repairs" },
    { key: "RESOLVED", label: "Hazard Neutralized", desc: "Verified restored to safety standards" },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const order = ["SUBMITTED", "AI_TRIAGED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex) return "COMPLETED";
    if (stepIndex === currentIndex) return "CURRENT";
    return "PENDING";
  };

  return (
    <>
      <Head>
        <title>Citizen Transparency Tracker | ASTRA-Grid Tactical</title>
      </Head>

      <TacticalNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Title Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-tactical-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            Stage 4 • Public Citizen Transparency & Real-Time Tracking
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Civic Incident Resolution Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Follow your complaint from initial citizen capture, through Gemini 2.5 Flash triage and multi-department dispatch, to final on-site resolution.
          </p>
        </div>

        {/* Report ID Search Bar */}
        <div className="rounded-xl border border-slate-800 bg-obsidian-900/90 p-4 shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={reportIdInput}
                onChange={(e) => setReportIdInput(e.target.value)}
                placeholder="Enter Ticket ID (e.g. AST-109)..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-tactical-cyan font-mono text-xs"
                aria-label="Search Report ID"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-tactical-cyan text-obsidian-950 font-mono text-xs font-bold hover:bg-cyan-300 transition"
            >
              Track Ticket
            </button>
          </form>

          {/* Quick-Select Sample Tickets */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <span className="text-slate-500">Sample Tickets:</span>
            {sampleTickets.map((tId) => (
              <button
                key={tId}
                onClick={() => {
                  setReportIdInput(tId);
                  const found = reports.find((r) => r.id === tId);
                  if (found) setCurrentReport(found);
                }}
                className={`px-2 py-0.5 rounded border text-[11px] transition ${
                  currentReport?.id === tId
                    ? "bg-slate-800 border-tactical-cyan text-tactical-cyan font-bold"
                    : "bg-obsidian-950 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                #{tId}
              </button>
            ))}
          </div>

          {searchError && (
            <div className="mt-3 p-2 rounded bg-tactical-crimson/20 border border-tactical-crimson/40 text-tactical-crimson text-xs font-mono">
              {searchError}
            </div>
          )}
        </div>

        {/* Selected Report Details & Timeline */}
        {currentReport && (
          <div className="rounded-xl border border-slate-800 bg-obsidian-900/95 p-6 shadow-2xl flex flex-col gap-6 reticle-corner">
            {/* Header Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-tactical-cyan">
                    #{currentReport.id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {currentReport.category}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white mt-1">
                  {currentReport.title}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  📍 {currentReport.address} ({currentReport.sub_area})
                </p>
              </div>

              {/* Priority & Status Badges */}
              <div className="flex flex-col items-start sm:items-end gap-1 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
                  STATUS: <strong className="text-tactical-cyan">{currentReport.status}</strong>
                </span>
                <span className="text-[11px] text-slate-400">
                  Priority Score: <strong className="text-tactical-crimson">{currentReport.priority_score}/100</strong>
                </span>
              </div>
            </div>

            {/* Stepper Progress Timeline */}
            <div>
              <div className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-4">
                Operational Progress Steps
              </div>
              <div className="relative flex flex-col sm:flex-row justify-between gap-4">
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.key, currentReport.status);
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-start sm:items-center text-left sm:text-center">
                      {/* Step Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold mb-2 transition ${
                          status === "COMPLETED"
                            ? "bg-tactical-emerald text-obsidian-950 shadow-emerald-glow"
                            : status === "CURRENT"
                            ? "bg-tactical-cyan text-obsidian-950 animate-pulse shadow-cyan-glow"
                            : "bg-obsidian-950 border border-slate-800 text-slate-500"
                        }`}
                      >
                        {status === "COMPLETED" ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="text-xs font-bold text-white font-mono">{step.label}</div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">{step.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dispatch & Operations Status Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-lg bg-obsidian-950 border border-slate-800 p-4">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                  Lead Municipal Department
                </span>
                <span className="text-sm font-bold text-tactical-cyan">
                  {currentReport.assigned_department || "MUNICIPAL DISPATCH PENDING"}
                </span>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  {currentReport.assigned_department
                    ? "Unit mobilized under high-priority emergency municipal protocols."
                    : "AI triaged; waiting for sector supervisor confirmation."}
                </p>
              </div>

              <div className="rounded-lg bg-obsidian-950 border border-slate-800 p-4">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                  Field Crew & Dispatch Log
                </span>
                <p className="text-slate-200 text-xs font-sans">
                  {currentReport.dispatch_notes || "Awaiting initial field crew status log."}
                </p>
              </div>
            </div>

            {/* Duplicate Consolidation Information */}
            {currentReport.duplicate_count && currentReport.duplicate_count > 1 ? (
              <div className="rounded-lg bg-cyan-950/20 border border-tactical-cyan/40 p-4 text-xs font-mono text-slate-300 flex items-start gap-3">
                <GitMerge className="w-5 h-5 text-tactical-cyan shrink-0 mt-0.5" />
                <div>
                  <strong className="text-tactical-cyan">
                    Community Corroboration Active ({currentReport.duplicate_count} Linked Citizen Reports):
                  </strong>
                  <p className="text-slate-300 text-xs font-sans mt-1">
                    Multiple neighbors within 250m reported this identical issue. Rather than dispersing crews, ASTRA-Grid consolidated these reports into this master ticket, boosting its priority score to ensure rapid emergency dispatch.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Explainable AI Reasoning */}
            <div className="rounded-lg bg-obsidian-950 border border-slate-800 p-4 text-xs">
              <span className="text-tactical-cyan font-mono text-[10px] block uppercase font-bold mb-1">
                Why was this priority assigned? (Explainable AI Transparency)
              </span>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                {currentReport.ai_explanation}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
