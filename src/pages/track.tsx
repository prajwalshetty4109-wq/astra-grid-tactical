import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import { CivicReport } from "@/lib/validators";
import { INITIAL_SYNTHETIC_REPORTS } from "@/lib/syntheticReports";
import {
  Search,
  CheckCircle2,
  Clock,
  GitMerge,
} from "lucide-react";

/**
 * Stage 4 (Act) Student Resolution Tracker page.
 * Provides transparent status progression from SUBMITTED to RESOLVED,
 * displaying explainable AI priority factors, linked corroborating student reports, and technician notes.
 */
export default function TrackPage() {
  const router = useRouter();
  const [reportIdInput, setReportIdInput] = useState("CF-104");
  const [currentReport, setCurrentReport] = useState<CivicReport | null>(null);
  const [reports, setReports] = useState<CivicReport[]>(INITIAL_SYNTHETIC_REPORTS);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports/state")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reports) {
          setReports(data.reports);
        }
      })
      .catch(() => {
        // Fall back gracefully to initial synthetic reports
      });
  }, []);

  useEffect(() => {
    const id = (router.query.id as string) || "CF-104";
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
      setSearchError(`Ticket #${query} not found in facility database.`);
    }
  };

  const sampleTickets = ["CF-104", "CF-101", "CF-201", "CF-301", "CF-401", "CF-502"];

  const steps = [
    { key: "SUBMITTED", label: "Student Intake Logged", desc: "Submitted via campus portal" },
    { key: "AI_TRIAGED", label: "Gemini 2.5 Flash Triaged", desc: "Prioritized & duplicate checked" },
    { key: "ASSIGNED", label: "Maintenance Crew Alerted", desc: "Assigned to specialized team" },
    { key: "IN_PROGRESS", label: "Technician On-Site", desc: "Repairs actively underway" },
    { key: "RESOLVED", label: "Restoration Signed Off", desc: "Tested and verified functional" },
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
        <title>Live Student Resolution Tracker | CampusFix</title>
        <meta
          name="description"
          content="Live Student Work Order Resolution Tracker: Track campus maintenance complaints from submission through Gemini 2.5 Flash triage to field sign-off."
        />
      </Head>

      <TacticalNavbar />

      <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Title Header */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider mb-1 font-semibold">
            <Clock className="w-4 h-4" aria-hidden="true" />
            Stage 4 • Student Transparency & Real-Time Resolution Timeline
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Campus Work Order Resolution Timeline
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Track your facility maintenance request from student capture, through Gemini 2.5 Flash triage and crew assignment, to final on-site repair.
          </p>
        </div>

        {/* Ticket Lookup Bar */}
        <section aria-label="Ticket Search" className="rounded-2xl border border-white/15 bg-neutral-950 p-5 shadow-3d-card">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" aria-hidden="true" />
              <label htmlFor="ticket-search-input" className="sr-only">Search Ticket ID</label>
              <input
                id="ticket-search-input"
                type="text"
                value={reportIdInput}
                onChange={(e) => setReportIdInput(e.target.value)}
                placeholder="Enter Ticket ID (e.g. CF-104)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white font-mono text-xs"
                aria-label="Enter Ticket ID to track"
              />
            </div>
            <button
              type="submit"
              aria-label="Track Ticket by ID"
              className="px-6 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-neutral-200 transition shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
            >
              Track Ticket
            </button>
          </form>

          {/* Quick-Select Sample Tickets */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-white/10 text-xs font-mono" role="group" aria-label="Sample Tickets Quick Selector">
            <span className="text-neutral-500">Sample Tickets:</span>
            {sampleTickets.map((tId) => (
              <button
                key={tId}
                type="button"
                aria-label={`Select sample ticket #${tId}`}
                onClick={() => {
                  setReportIdInput(tId);
                  const found = reports.find((r) => r.id === tId);
                  if (found) setCurrentReport(found);
                }}
                className={`px-2.5 py-1 rounded-md border text-[11px] transition ${
                  currentReport?.id === tId
                    ? "bg-white text-black border-white font-bold shadow-sm"
                    : "bg-black border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                #{tId}
              </button>
            ))}
          </div>

          {searchError && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-3 p-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-mono"
            >
              {searchError}
            </div>
          )}
        </section>

        {/* Selected Ticket Details & Timeline */}
        {currentReport && (
          <article
            aria-labelledby="ticket-detail-title"
            className="rounded-2xl border border-white/15 bg-neutral-950 p-6 sm:p-8 shadow-3d-card flex flex-col gap-6 reticle-corner-white"
          >
            {/* Header Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">
                    #{currentReport.id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-white/10">
                    {currentReport.category}
                  </span>
                </div>
                <h2 id="ticket-detail-title" className="text-base font-semibold text-white mt-1">
                  {currentReport.title}
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  📍 {currentReport.sub_area} • {currentReport.address}
                </p>
              </div>

              {/* Priority & Status Badges */}
              <div className="flex flex-col items-start sm:items-end gap-1.5 font-mono text-xs">
                <span className="px-3 py-1 rounded-md bg-neutral-900 border border-white/15 text-white">
                  STATUS: <strong className="text-white">{currentReport.status}</strong>
                </span>
                <span className="text-[11px] text-neutral-400">
                  Priority Score: <strong className="text-white">{currentReport.priority_score}/100</strong>
                </span>
              </div>
            </div>

            {/* Stepper Progress Timeline */}
            <div>
              <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-4 font-bold">
                Resolution Timeline
              </div>
              <ol className="relative flex flex-col sm:flex-row justify-between gap-4" aria-label="Work Order Progress Steps">
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.key, currentReport.status);
                  return (
                    <li key={step.key} className="flex-1 flex flex-col items-start sm:items-center text-left sm:text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold mb-2 transition ${
                          status === "COMPLETED"
                            ? "bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.3)]"
                            : status === "CURRENT"
                            ? "bg-neutral-800 text-white border-2 border-white animate-pulse"
                            : "bg-black border border-white/15 text-neutral-600"
                        }`}
                        aria-hidden="true"
                      >
                        {status === "COMPLETED" ? <CheckCircle2 className="w-4 h-4 text-black" aria-hidden="true" /> : idx + 1}
                      </div>
                      <div className="text-xs font-bold text-white font-mono">{step.label}</div>
                      <div className="text-[10px] text-neutral-400 font-sans mt-0.5">{step.desc}</div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Crew & Dispatch Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-xl bg-neutral-900 border border-white/10 p-4 shadow-3d-subtle">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">
                  Assigned Maintenance Crew
                </span>
                <span className="text-sm font-bold text-white">
                  {currentReport.assigned_department || "FACILITY DISPATCH PENDING"}
                </span>
                <p className="text-neutral-400 text-[11px] mt-1 font-sans">
                  {currentReport.assigned_department
                    ? "Work order authorized under campus high-priority maintenance protocols."
                    : "AI triaged; waiting for building supervisor confirmation."}
                </p>
              </div>

              <div className="rounded-xl bg-neutral-900 border border-white/10 p-4 shadow-3d-subtle">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">
                  Field Technician Log
                </span>
                <p className="text-neutral-200 text-xs font-sans">
                  {currentReport.dispatch_notes || "Awaiting initial technician on-site status log."}
                </p>
              </div>
            </div>

            {/* Duplicate Community Corroboration */}
            {currentReport.duplicate_count && currentReport.duplicate_count > 1 ? (
              <div className="rounded-xl bg-neutral-900 border border-white/20 p-4 text-xs font-mono text-neutral-300 flex items-start gap-3 shadow-3d-subtle">
                <GitMerge className="w-5 h-5 text-white shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="text-white">
                    Campus Corroboration Active ({currentReport.duplicate_count} Linked Student Reports):
                  </strong>
                  <p className="text-neutral-400 text-xs font-sans mt-1">
                    Multiple students in this building wing reported this exact problem. Rather than dispatching redundant crews, CampusFix consolidated these tickets into this master work order to boost priority.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Explainable AI Reasoning */}
            <div className="rounded-xl bg-neutral-900 border border-white/10 p-4 text-xs">
              <span className="text-white font-mono text-[10px] block uppercase font-bold mb-1">
                Why was this priority assigned? (Explainable AI Transparency)
              </span>
              <p className="text-neutral-300 font-sans leading-relaxed text-xs">
                {currentReport.ai_explanation}
              </p>
            </div>
          </article>
        )}
      </main>
    </>
  );
}
