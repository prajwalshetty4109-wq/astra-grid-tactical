import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { TacticalNavbar } from "@/components/TacticalNavbar";
import { CitizenCaptureForm } from "@/components/CitizenCaptureForm";
import { Radio, Building2 } from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const isDemo = router.query.demo === "true";

  return (
    <>
      <Head>
        <title>Student & Staff Facility Intake | CampusFix</title>
        <meta
          name="description"
          content="Rapid <60s mobile-ready campus facility intake with instant Gemini 2.5 Flash explainable triage and duplicate checking."
        />
      </Head>

      <TacticalNavbar />

      <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* Header Ribbon */}
        <div className="w-full max-w-3xl mb-6 flex items-center justify-between font-mono text-xs text-neutral-400 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span className="text-white font-bold">STAGE 1: STUDENT & STAFF INTAKE</span>
          </div>
          <span className="text-neutral-400">&lt;60-Second Mobile Intake</span>
        </div>

        {/* Citizen Form Component */}
        <CitizenCaptureForm initialDemo={isDemo} />
      </main>
    </>
  );
}
