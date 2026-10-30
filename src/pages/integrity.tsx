import React from "react";
import Head from "next/head";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import {
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  GitMerge,
  Compass,
  ArrowRight,
  Database,
  Calculator,
} from "lucide-react";

export default function IntegrityPage() {
  return (
    <>
      <Head>
        <title>AI Methodology, Limitations & Honesty Note | ASTRA-Grid Tactical</title>
      </Head>

      <TacticalNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-tactical-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Methodology & Ethical AI Compliance • Hackathon Sections 7 & 8
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            AI Engine Architecture, Limitations & Honesty Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans leading-relaxed">
            ASTRA-Grid Tactical operates with complete mathematical and architectural transparency. We explicitly state what is powered by live production APIs, what is synthetically modeled for the hackathon, where the AI model can make mistakes, and how we mitigate hallucination risks.
          </p>
        </div>

        {/* Section 1: Real vs Mocked Matrix */}
        <section aria-labelledby="real-vs-mocked" className="flex flex-col gap-3">
          <h2 id="real-vs-mocked" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-tactical-cyan" />
            1. Production Reality vs. Synthetic Hackathon Modeling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What is Real */}
            <div className="rounded-xl border border-tactical-emerald/40 bg-emerald-950/15 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-tactical-emerald font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                What is Real & Production-Executed
              </div>
              <ul className="text-xs text-slate-200 font-sans space-y-2 leading-relaxed">
                <li>
                  <strong className="text-white font-mono">Live Google Gen AI SDK:</strong> Production invocation of <code className="text-tactical-cyan bg-slate-900 px-1 py-0.5 rounded">gemini-2.5-flash</code> via the official <code className="text-tactical-cyan bg-slate-900 px-1 py-0.5 rounded">@google/genai</code> TypeScript SDK for multimodal triage, duplicate reasoning, and 60s executive action briefs.
                </li>
                <li>
                  <strong className="text-white font-mono">Real Haversine Distance Math:</strong> Deterministic spherical trigonometry (<code className="text-tactical-cyan font-mono">R = 6,371,000m</code>) accurately calculating great-circle distance down to the meter.
                </li>
                <li>
                  <strong className="text-white font-mono">Real Token & Synonym Duplicate Detection:</strong> Combined token Dice coefficient, Jaccard intersection, and 8 civic synonym dictionaries (pothole/crater, flood/waterlogging, electrical/feeder).
                </li>
                <li>
                  <strong className="text-white font-mono">Zod Schema Validation:</strong> Strict runtime validation on all incoming API requests and database models.
                </li>
                <li>
                  <strong className="text-white font-mono">Resilient Dual-Tier Storage:</strong> Real Supabase PostgreSQL database support with automatic graceful fallback to in-memory/localStorage store so the app never crashes if cloud keys are offline.
                </li>
              </ul>
            </div>

            {/* What is Mocked / Synthetic */}
            <div className="rounded-xl border border-tactical-amber/40 bg-amber-950/15 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-tactical-amber font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                What is Synthetic / Simulated
              </div>
              <ul className="text-xs text-slate-200 font-sans space-y-2 leading-relaxed">
                <li>
                  <strong className="text-white font-mono">36 Pre-Seeded Citizen Reports:</strong> Generated deterministic civic reports reflecting authentic Bengaluru municipal challenges (MG Road Metro, Jayanagar Hospital, Hebbal Flyover).
                </li>
                <li>
                  <strong className="text-white font-mono">Field Crew GPS Telemetry:</strong> Simulated repair trucks and hydro-jetting units on the radar canvas (in a full deployment, this feeds from municipal vehicle AVL/GPS trackers).
                </li>
                <li>
                  <strong className="text-white font-mono">Simulated Masked Phone Numbers:</strong> Phone numbers are masked (<code className="text-slate-400 font-mono">***-***-4821</code>) to demonstrate citizen privacy protection compliant with civic data guidelines.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Transparent Priority Formula */}
        <section aria-labelledby="priority-formula" className="flex flex-col gap-3">
          <h2 id="priority-formula" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-tactical-cyan" />
            2. The Explainable Priority Formula (0 to 100)
          </h2>

          <div className="rounded-xl border border-slate-800 bg-obsidian-900/95 p-5 flex flex-col gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-obsidian-950 border border-tactical-cyan/40 text-center font-bold text-tactical-cyan text-sm">
              PriorityScore = SafetyRisk (0–40) + CascadeImpact (0–25) + DuplicateVolume (0–20) + VulnerableZone (0–15)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 font-sans">
              <div className="p-3 rounded bg-obsidian-950 border border-slate-800">
                <strong className="text-tactical-crimson font-mono block text-xs mb-1">
                  1. Safety & Life Risk Score (0–40)
                </strong>
                Evaluates immediate physical threat to human life. Live electrical wires submerged in floodwater score 39–40; high-speed expressway craters score 35–38; routine garbage collection delays score 8–12.
              </div>

              <div className="p-3 rounded bg-obsidian-950 border border-slate-800">
                <strong className="text-tactical-amber font-mono block text-xs mb-1">
                  2. Infrastructure Cascade Impact (0–25)
                </strong>
                Quantifies the probability that this failure triggers secondary domino collapses (e.g. blocked storm drain culvert backing up into road surface erosion and submerging electrical junction boxes).
              </div>

              <div className="p-3 rounded bg-obsidian-950 border border-slate-800">
                <strong className="text-tactical-cyan font-mono block text-xs mb-1">
                  3. Duplicate Volume / Citizen Multiplier (0–20)
                </strong>
                Counts corroborating citizen complaints within 250m. 1 report = 6 pts; 2–3 reports = 13 pts; 4–5 reports = 17 pts; 6+ independent reports = 20 pts.
              </div>

              <div className="p-3 rounded bg-obsidian-950 border border-slate-800">
                <strong className="text-tactical-emerald font-mono block text-xs mb-1">
                  4. Vulnerable Zone Proximity (0–15)
                </strong>
                Proximity to hospitals (emergency ambulance lanes), schools (child drop-off zones), metro transit stations, and arterial flyovers.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Where the AI Can Be Wrong */}
        <section aria-labelledby="ai-failure-modes" className="flex flex-col gap-3">
          <h2 id="ai-failure-modes" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-tactical-amber" />
            3. Where the AI Can Be Wrong (Failure Modes & Mitigation)
          </h2>

          <div className="rounded-xl border border-slate-800 bg-obsidian-900/95 p-5 flex flex-col gap-3 font-sans text-xs">
            <div className="space-y-3">
              <div className="p-3 rounded bg-obsidian-950 border border-slate-800">
                <strong className="text-white font-mono text-xs block mb-1">
                  Edge Case A: False Duplicate Merges Across Parallel Streets
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  Two potholes located 80 meters apart might be on separate parallel roads separated by a railway wall. Pure Haversine distance would treat them as proximate.
                  <br />
                  <span className="text-tactical-cyan font-mono font-semibold">Mitigation:</span> We require street name token cross-matching and permit human decision-makers to unmerge duplicate recommendations with 1 click.
                </p>
              </div>

              <div className="p-3 rounded bg-obsidian-950 border border-slate-800">
                <strong className="text-white font-mono text-xs block mb-1">
                  Edge Case B: Citizen Hyperbole & Text Exaggeration
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  Citizens frequently write &quot;the entire street is destroyed&quot; when describing a single paver block wobble.
                  <br />
                  <span className="text-tactical-cyan font-mono font-semibold">Mitigation:</span> Multimodal photo verification through Gemini Vision cross-checks image pixels against text claims to moderate over-inflated severity claims.
                </p>
              </div>

              <div className="p-3 rounded bg-obsidian-950 border border-slate-800">
                <strong className="text-white font-mono text-xs block mb-1">
                  Edge Case C: Night-Time Low-Light Image Ambiguity
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  Grainy low-resolution nighttime photos can make wet asphalt puddles look identical to black motor oil spills.
                  <br />
                  <span className="text-tactical-cyan font-mono font-semibold">Mitigation:</span> Gemini returns a confidence rating and explicitly flags low-light ambiguity for human dispatch verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: What We Would Build Next */}
        <section aria-labelledby="roadmap" className="flex flex-col gap-3">
          <h2 id="roadmap" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-tactical-cyan" />
            4. Production Roadmap: What We Would Build Next
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
              <strong className="text-white block mb-1">1. Official Municipal GIS Polygons</strong>
              <p className="text-slate-400 font-sans">
                Replace circular distance radius with actual cadastre street centerlines and storm drain pipe flow vectors.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
              <strong className="text-white block mb-1">2. Citizen WhatsApp / SMS Webhooks</strong>
              <p className="text-slate-400 font-sans">
                Direct intake via messaging apps with automatic voice note transcription using Gemini Audio models.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
              <strong className="text-white block mb-1">3. Fleet Dashcam Edge Ingestion</strong>
              <p className="text-slate-400 font-sans">
                Mount edge AI cameras on municipal garbage collection trucks to continuously scan and auto-report road damage.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-800">
              <strong className="text-white block mb-1">4. Contractor SLA Audit Trail</strong>
              <p className="text-slate-400 font-sans">
                Before-and-after photo diffing to prevent fraudulent municipal repair billing and closeouts.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
