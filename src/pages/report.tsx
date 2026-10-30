import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import { CitizenCaptureForm } from "@/components/CitizenCaptureForm";
import { ShieldCheck, Zap, Radio, Clock } from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const isDemo = router.query.demo === "true";

  return (
    <>
      <Head>
        <title>Citizen Rapid Intake Portal | ASTRA-Grid Tactical</title>
        <meta
          name="description"
          content="Rapid <60s mobile-ready citizen intake for civic hazards with instant Gemini 2.5 Flash explainable triage and duplicate checking."
        />
      </Head>

      <TacticalNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* Header Ribbon */}
        <div className="w-full max-w-3xl mb-6 flex items-center justify-between font-mono text-xs text-slate-400 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-tactical-cyan animate-pulse" />
            <span className="text-white font-bold">STAGE 1: CITIZEN CAPTURE PORTAL</span>
          </div>
          <span className="text-tactical-cyan">&lt;60-Second Mobile Intake</span>
        </div>

        {/* Citizen Form Component */}
        <CitizenCaptureForm initialDemo={isDemo} />
      </main>
    </>
  );
}
