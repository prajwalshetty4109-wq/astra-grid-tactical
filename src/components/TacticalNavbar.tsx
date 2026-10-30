import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ShieldAlert,
  Radio,
  MapPin,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Cpu,
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

export const TacticalNavbar: React.FC<TacticalNavbarProps> = ({
  kpis = { totalReports: 36, criticalCount: 14, activeHotspots: 3, duplicatesDetected: 16 },
  onResetData,
  onTriggerDemoStep,
}) => {
  const router = useRouter();
  const [demoBannerOpen, setDemoBannerOpen] = useState(true);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (confirm("Reset operational state to 36 pre-seeded synthetic reports?")) {
      setResetting(true);
      try {
        await fetch("/api/reports/reset", { method: "POST" });
        if (onResetData) {
          onResetData();
        } else {
          router.reload();
        }
      } catch (err) {
        console.error("Reset error:", err);
      } finally {
        setResetting(false);
      }
    }
  };

  const navItems = [
    { label: "Tactical Deck", href: "/", icon: Layers },
    { label: "Citizen Intake", href: "/report", icon: Radio },
    { label: "Citizen Tracker", href: "/track", icon: MapPin },
    { label: "AI Integrity & Math", href: "/integrity", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/90 bg-obsidian-900/95 backdrop-blur-md">
      {/* 5-Min Judge Demo Walkthrough Bar */}
      <div className="bg-slate-950 border-b border-cyan-950/60 text-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-tactical-cyan/15 border border-tactical-cyan/40 text-tactical-cyan font-mono font-semibold tracking-wider text-[11px] uppercase">
              <Sparkles className="w-3 h-3 animate-spin text-tactical-cyan" />
              Judge Quick-Demo Tour
            </span>
            <span className="hidden md:inline text-slate-400 text-xs font-sans">
              4-Step Evaluator Flow (Capture → Understand → Reveal → Act)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDemoBannerOpen(!demoBannerOpen)}
              className="text-slate-400 hover:text-tactical-cyan flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800/60 transition"
              aria-expanded={demoBannerOpen}
              aria-label="Toggle Judge Demo Banner"
            >
              <span className="text-[11px] font-mono">{demoBannerOpen ? "Hide Steps" : "Show Steps"}</span>
              {demoBannerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {demoBannerOpen && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-2.5 pt-1 grid grid-cols-2 lg:grid-cols-4 gap-2 border-t border-slate-800/40">
            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(1);
                else router.push("/report?demo=true");
              }}
              className="text-left p-2 rounded bg-obsidian-800/90 hover:bg-slate-800/90 border border-slate-800 hover:border-tactical-cyan/60 transition group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-tactical-cyan mb-1">
                <span className="font-bold">STEP 1: CAPTURE</span>
                <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-300">15s</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 group-hover:text-white">
                Simulate Urgent Flood + Live Wire Intake
              </p>
            </button>

            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(2);
                else router.push("/?filter=CRITICAL");
              }}
              className="text-left p-2 rounded bg-obsidian-800/90 hover:bg-slate-800/90 border border-slate-800 hover:border-tactical-amber/60 transition group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-tactical-amber mb-1">
                <span className="font-bold">STEP 2: UNDERSTAND</span>
                <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-300">AI Triage</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 group-hover:text-white">
                Inspect 98/100 Risk Score & Duplicate Link
              </p>
            </button>

            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(3);
                else router.push("/?cluster=HOTSPOT-1");
              }}
              className="text-left p-2 rounded bg-obsidian-800/90 hover:bg-slate-800/90 border border-slate-800 hover:border-tactical-crimson/60 transition group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-tactical-crimson mb-1">
                <span className="font-bold">STEP 3: REVEAL</span>
                <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-300">Gemini</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 group-hover:text-white">
                Trigger 60s MG Road Hotspot Brief
              </p>
            </button>

            <button
              onClick={() => {
                if (onTriggerDemoStep) onTriggerDemoStep(4);
                else router.push("/track?id=AST-109");
              }}
              className="text-left p-2 rounded bg-obsidian-800/90 hover:bg-slate-800/90 border border-slate-800 hover:border-tactical-emerald/60 transition group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-tactical-emerald mb-1">
                <span className="font-bold">STEP 4: ACT</span>
                <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-300">Live SLA</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 group-hover:text-white">
                Dispatch Units & Track Citizen Receipt
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Primary Tactical Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded bg-obsidian-800 border border-tactical-cyan/40 flex items-center justify-center shadow-cyan-glow group-hover:border-tactical-cyan transition">
              <ShieldAlert className="w-5 h-5 text-tactical-cyan group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-wider text-white">
                  ASTRA<span className="text-tactical-cyan">-GRID</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  TACTICAL v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-tight hidden sm:block">
                Explainable Civic Crisis & Hotspot Command Center
              </p>
            </div>
          </Link>
        </div>

        {/* Tactical Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-obsidian-950/70 p-1 rounded-lg border border-slate-800/80">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-tactical-cyan border border-tactical-cyan/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-tactical-cyan" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Operational Status & Reset */}
        <div className="flex items-center gap-3">
          {/* AI Engine Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-tactical-cyan animate-pulse" />
            <span className="text-slate-400">AI:</span>
            <span className="text-tactical-cyan font-medium">Gemini 2.5 Flash</span>
          </div>

          {/* Quick Metrics */}
          <div className="hidden sm:flex items-center gap-2.5 font-mono text-xs text-slate-400 bg-obsidian-950 px-2.5 py-1 rounded border border-slate-800/80">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tactical-crimson animate-ping" />
              <span className="text-tactical-crimson font-bold">{kpis.criticalCount}</span>
              <span className="text-[10px]">CRITICAL</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1">
              <span className="text-tactical-amber font-bold">{kpis.activeHotspots}</span>
              <span className="text-[10px]">HOTSPOTS</span>
            </div>
          </div>

          {/* Baseline Reset Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-obsidian-800 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 transition"
            title="Reset to 36 baseline synthetic reports"
            aria-label="Reset operational state to 36 reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin text-tactical-cyan" : ""}`} />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>
    </header>
  );
};
