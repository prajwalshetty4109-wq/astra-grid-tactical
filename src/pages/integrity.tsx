import React from "react";
import Head from "next/head";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Database,
  Calculator,
} from "lucide-react";

/**
 * AI Methodology, Limitations & Operational Honesty Matrix Page.
 * Documents production-ready vs. synthetic elements, mathematical priority scoring equations,
 * known AI failure modes, and mitigation strategies.
 */
export default function IntegrityPage() {
  return (
    <>
      <Head>
        <title>AI Methodology, Limitations & Honesty Note | CampusFix</title>
        <meta
          name="description"
          content="CampusFix AI Methodology, Mathematical Priority Formulas, Honesty Matrix, and Technical Limitations."
        />
      </Head>

      <TacticalNavbar />

      <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider mb-1 font-semibold">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Methodology & Ethical AI Compliance • Hackathon Sections 7 & 8
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            AI Engine Architecture, Limitations & Honesty Matrix
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-sans leading-relaxed">
            CampusFix is built with complete mathematical and operational transparency. We explicitly document what is powered by live production APIs, what is synthetically modeled for the hackathon, where the AI model can make mistakes, and how we mitigate hallucination risks.
          </p>
        </div>

        {/* Section 1: Real vs Mocked Matrix */}
        <section aria-labelledby="real-vs-mocked" className="flex flex-col gap-3">
          <h2 id="real-vs-mocked" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-white" aria-hidden="true" />
            1. Production Reality vs. Synthetic Hackathon Modeling
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What is Real */}
            <div className="rounded-2xl border border-white/20 bg-neutral-950 p-6 flex flex-col gap-3 shadow-3d-card">
              <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                What is Real & Production-Executed
              </div>
              <ul className="text-xs text-neutral-300 font-sans space-y-2.5 leading-relaxed">
                <li>
                  <strong className="text-white font-mono">Live Google Gen AI SDK:</strong> Production invocation of <code className="text-white bg-neutral-900 px-1 py-0.5 rounded border border-white/10">gemini-2.5-flash</code> via the official <code className="text-white bg-neutral-900 px-1 py-0.5 rounded border border-white/10">@google/genai</code> TypeScript SDK for multimodal triage, duplicate reasoning, and 60s maintenance action briefs.
                </li>
                <li>
                  <strong className="text-white font-mono">Real Haversine Distance Math:</strong> Deterministic spherical trigonometry (<code className="text-white font-mono">R = 6,371,000m</code>) calculating building distances down to the meter.
                </li>
                <li>
                  <strong className="text-white font-mono">Real Token & Synonym Duplicate Detection:</strong> Combined token Dice coefficient, containment index, and 7 campus facility synonym dictionaries (plumbing/leak, electrical/sparking, it_network/wifi, hvac/cooling).
                </li>
                <li>
                  <strong className="text-white font-mono">Strict Zod Schema Validation:</strong> Strict runtime validation on all incoming API requests and work order models.
                </li>
                <li>
                  <strong className="text-white font-mono">Resilient Dual-Tier Storage:</strong> Real Supabase PostgreSQL database support with automatic graceful fallback to in-memory/localStorage store so the platform operates continuously on Vercel even if database keys are uninitialized.
                </li>
              </ul>
            </div>

            {/* What is Mocked / Synthetic */}
            <div className="rounded-2xl border border-white/20 bg-neutral-950 p-6 flex flex-col gap-3 shadow-3d-card">
              <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                What is Synthetic / Simulated
              </div>
              <ul className="text-xs text-neutral-300 font-sans space-y-2.5 leading-relaxed">
                <li>
                  <strong className="text-white font-mono">36 Pre-Seeded Campus Tickets:</strong> Deterministic synthetic reports reflecting authentic university maintenance challenges (Science Block, Central Library, Student Dorms, Engineering Wing, Cafeteria, Admin).
                </li>
                <li>
                  <strong className="text-white font-mono">Technician Dispatch ETA:</strong> Simulated repair van locations and on-site crew status (in production, integrated with campus facility work order dispatch systems).
                </li>
                <li>
                  <strong className="text-white font-mono">Masked Student IDs:</strong> Student IDs are masked (<code className="text-neutral-400 font-mono">STU-***-4821</code>) to demonstrate student privacy protection compliant with FERPA and campus data policies.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Transparent Priority Formula */}
        <section aria-labelledby="priority-formula" className="flex flex-col gap-3">
          <h2 id="priority-formula" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-white" aria-hidden="true" />
            2. The Explainable Priority Formula (0 to 100)
          </h2>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-6 flex flex-col gap-4 font-mono text-xs shadow-3d-card">
            <div className="p-3.5 rounded-xl bg-black border border-white/20 text-center font-bold text-white text-sm shadow-sm">
              PriorityScore = SafetyRisk (0–40) + CascadeImpact (0–25) + DuplicateVolume (0–20) + VulnerableZone (0–15)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300 font-sans">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10">
                <strong className="text-white font-mono block text-xs mb-1 font-bold">
                  1. Safety & Hazard Risk Score (0–40)
                </strong>
                Evaluates immediate physical danger to students and lab personnel. Sparking 220V outlets submerged in water score 39–40; server room water leaks score 34–38; minor furniture armrest looseness scores 8–12.
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10">
                <strong className="text-white font-mono block text-xs mb-1 font-bold">
                  2. Academic & Facility Cascade Impact (0–25)
                </strong>
                Quantifies the probability of cascading disruption to scheduled lectures, lab experiments, or campus core IT (e.g. chiller line break leaking into server racks and disabling lecture hall AV during exams).
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10">
                <strong className="text-white font-mono block text-xs mb-1 font-bold">
                  3. Duplicate Volume / Student Corroboration (0–20)
                </strong>
                Counts independent student complaints within the building corridor (0 dups = 6 pts, 1–2 = 13 pts, 3–4 = 17 pts, 6+ = 20 pts).
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10">
                <strong className="text-white font-mono block text-xs mb-1 font-bold">
                  4. High-Occupancy Zone Sensitivity (0–15)
                </strong>
                Proximity to research wet labs, Central Library quiet commons, Student Dorms, and main dining halls.
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Where the AI Can Be Wrong */}
        <section aria-labelledby="ai-failure-modes" className="flex flex-col gap-3">
          <h2 id="ai-failure-modes" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white" aria-hidden="true" />
            3. Where the AI Can Be Wrong (Failure Modes & Mitigations)
          </h2>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-6 flex flex-col gap-3 font-sans text-xs shadow-3d-card">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10">
                <strong className="text-white font-mono text-xs block mb-1">
                  Edge Case A: Vertical Floor Separation in Multi-Story Buildings
                </strong>
                <p className="text-neutral-300 leading-relaxed">
                  Two plumbing leaks reported at identical lat/lon coordinates might be on Floor 1 and Floor 4. Pure 2D horizontal Haversine distance would treat them as identical incidents.
                  <br />
                  <span className="text-white font-mono font-bold">Mitigation:</span> We enforce room and floor number token cross-matching and provide a 1-click override to unmerge separate floor complaints.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10">
                <strong className="text-white font-mono text-xs block mb-1">
                  Edge Case B: Student Language Exaggeration
                </strong>
                <p className="text-neutral-300 leading-relaxed">
                  Students may describe a dripping water fountain as &quot;the entire cafeteria is completely flooded.&quot;
                  <br />
                  <span className="text-white font-mono font-bold">Mitigation:</span> Multimodal photo analysis via Gemini Vision validates physical severity against text claims before calculating priority.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10">
                <strong className="text-white font-mono text-xs block mb-1">
                  Edge Case C: Low-Light Basement Ambiguity
                </strong>
                <p className="text-neutral-300 leading-relaxed">
                  Grainy low-light photos in mechanical dorm basements can make harmless condensation puddles look like hazardous oil leaks.
                  <br />
                  <span className="text-white font-mono font-bold">Mitigation:</span> Gemini tags low-light ambiguity for mandatory technician physical inspection prior to crew dispatch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: What We Would Build Next */}
        <section aria-labelledby="roadmap" className="flex flex-col gap-3">
          <h2 id="roadmap" className="font-mono text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            4. Production Roadmap: What We Would Build Next
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-neutral-950 border border-white/15 shadow-3d-subtle">
              <strong className="text-white block mb-1">1. Campus BACnet / BMS Sensor Integration</strong>
              <p className="text-neutral-400 font-sans">
                Automatically ingest telemetry from building HVAC chillers, water pressure flowmeters, and electrical sub-meters.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-white/15 shadow-3d-subtle">
              <strong className="text-white block mb-1">2. Student WhatsApp & Slack Bot Webhook</strong>
              <p className="text-neutral-400 font-sans">
                Enable instant complaint submission and progress notifications directly inside university campus channels.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-white/15 shadow-3d-subtle">
              <strong className="text-white block mb-1">3. Facility Inventory & Parts Management</strong>
              <p className="text-neutral-400 font-sans">
                Automatically check storeroom inventory for required replacement parts (e.g. copper pipe sleeves, breakers, Cisco APs).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-white/15 shadow-3d-subtle">
              <strong className="text-white block mb-1">4. Work Order Verification & Sign-off</strong>
              <p className="text-neutral-400 font-sans">
                Before-and-after photo diffing to ensure contracted technicians fully resolved the issue before closing tickets.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
