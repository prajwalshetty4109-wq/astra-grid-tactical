import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Radio,
  MapPin,
  FileText,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Cpu,
  Building2,
} from "lucide-react";

interface TacticalNavbarProps {
  kpis?: {
    totalReports?: number;
    criticalCount?: number;
    activeHotspots?: number;
    duplicatesDetected?: number;
  };
  onResetData?: () => void;
  onTriggerDemoStep?: (step: number) => void;
}

/**
 * Tactical monochrome operations navbar with 5-minute judge demo flow bar,
 * live telemetry indicators, and fast navigation between lifecycle stages.
 */
export const TacticalNavbar: React.FC<TacticalNavbarProps> = ({
  kpis = { totalReports: 36, criticalCount: 14, activeHotspots: 3, duplicatesDetected: 16 },
  onResetData,
  onTriggerDemoStep,
}) => {
  const router = useRouter();
  const [demoBannerOpen, setDemoBannerOpen] = useState(true);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (confirm("Reset campus facility state to 36 baseline synthetic reports?")) {
      setResetting(true);
      try {
        await fetch("/api/reports/reset", { method: "POST" });
        if (onResetData) {
          onResetData();
        } else {
          router.reload();
        }
      } catch {
        // Silently handle reset error on client
      } finally {
        setResetting(false);
      }
    }
  };

  const navItems = [
    { label: "Campus Deck", href: "/", icon: Layers },
    { label: "Facility Intake", href: "/report", icon: Radio },
    { label: "Student Tracker", href: "/track", icon: MapPin },
    { label: "AI Integrity & Math", href: "/integrity", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
      {/* 5-Min Judge Demo Walkthrough Bar */}
      <div className="bg-neutral-950 border-b border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-black font-mono font-bold tracking-wider text-[11px] uppercase shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
              <Sparkles className="w-3 h-3 text-black animate-spin" aria-hidden="true" />
              5-Min Judge Demo Flow
            </span>
            <span className="hidden md:inline text-neutral-400 text-xs font-sans">
              4 Lifecycle Stages: Capture → Understand → Reveal → Act
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDemoBannerOpen(!demoBannerOpen)}
              className="text-neutral-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded border border-white/10 hover:border-white/30 transition text-[11px] font-mono"
              aria-expanded={demoBannerOpen}
              aria-label="Toggle Judge Demo Banner"
            >
              <span>{demoBannerOpen ? "Hide Steps" : "Show Steps"}</span>
              {demoBannerOpen ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {demoBannerOpen && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-3 pt-1 grid grid-cols-2 lg:grid-cols-4 gap-2 border-t border-white/5" role="group" aria-label="Demo Flow Steps">
            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(1);
                else router.push("/report?demo=true");
              }}
              aria-label="Step 1: Capture - Auto-Fill Science Lab Water Leak & Arcing Outlet"
              className="text-left p-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-850 border border-white/10 hover:border-white/30 transition group shadow-3d-subtle"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-white mb-1">
                <span className="font-bold">STEP 1: CAPTURE</span>
                <span className="text-[10px] bg-white/10 px-1 rounded text-neutral-300">15s</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-1 group-hover:text-white">
                Auto-Fill Science Lab Water Leak & Arcing Outlet
              </p>
            </button>

            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(2);
                else router.push("/?filter=CRITICAL");
              }}
              aria-label="Step 2: Understand - Inspect 98/100 Risk Score & Duplicate Link"
              className="text-left p-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-850 border border-white/10 hover:border-white/30 transition group shadow-3d-subtle"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-white mb-1">
                <span className="font-bold">STEP 2: UNDERSTAND</span>
                <span className="text-[10px] bg-white/10 px-1 rounded text-neutral-300">AI Triage</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-1 group-hover:text-white">
                Inspect 98/100 Risk Score & Duplicate Link
              </p>
            </button>

            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(3);
                else router.push("/?cluster=HOTSPOT-1");
              }}
              aria-label="Step 3: Reveal - Trigger 60s Science Block Maintenance Brief"
              className="text-left p-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-850 border border-white/10 hover:border-white/30 transition group shadow-3d-subtle"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-white mb-1">
                <span className="font-bold">STEP 3: REVEAL</span>
                <span className="text-[10px] bg-white/10 px-1 rounded text-neutral-300">Gemini</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-1 group-hover:text-white">
                Trigger 60s Science Block Maintenance Brief
              </p>
            </button>

            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(4);
                else router.push("/track?id=CF-104");
              }}
              aria-label="Step 4: Act - Dispatch Units & Track Student Timeline"
              className="text-left p-2.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-850 border border-white/10 hover:border-white/30 transition group shadow-3d-subtle"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-white mb-1">
                <span className="font-bold">STEP 4: ACT</span>
                <span className="text-[10px] bg-white/10 px-1 rounded text-neutral-300">Crew SLA</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-1 group-hover:text-white">
                Dispatch Units & Track Student Timeline
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Primary Monochrome 3D Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group" aria-label="CampusFix Home">
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-[0_4px_14px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-black" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold tracking-wider text-white">
                  CAMPUS<span className="text-neutral-400">FIX</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-300 border border-white/15">
                  FACILITIES v2.0
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-sans tracking-tight hidden sm:block">
                AI Smart-Facility Infrastructure Operations Command
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-white/10" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-neutral-400"}`} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Operational Status & Reset */}
        <div className="flex items-center gap-3">
          {/* AI Engine Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-950 border border-white/10 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-white animate-pulse" aria-hidden="true" />
            <span className="text-neutral-400">AI:</span>
            <span className="text-white font-medium">Gemini 2.5 Flash</span>
          </div>

          {/* Quick Metrics */}
          <div className="hidden sm:flex items-center gap-2.5 font-mono text-xs text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded border border-white/10">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" aria-hidden="true" />
              <span className="text-white font-bold">{kpis.criticalCount}</span>
              <span className="text-[10px]">CRITICAL</span>
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1">
              <span className="text-white font-bold">{kpis.activeHotspots}</span>
              <span className="text-[10px]">CLUSTERS</span>
            </div>
          </div>

          {/* Baseline Reset Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-xs font-mono text-neutral-300 transition"
            title="Reset to 36 baseline synthetic campus reports"
            aria-label="Reset operational state to 36 reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin text-white" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>
    </header>
  );
};
