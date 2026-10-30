import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CivicCategory, PriorityLevel } from "@/lib/validators";
import {
  Camera,
  MapPin,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  GitMerge,
  ArrowRight,
  ShieldAlert,
  Compass,
} from "lucide-react";

interface CitizenCaptureFormProps {
  initialDemo?: boolean;
}

export const CitizenCaptureForm: React.FC<CitizenCaptureFormProps> = ({ initialDemo = false }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CivicCategory>("WATERLOGGING");
  const [subArea, setSubArea] = useState("Sector 1: MG Road Metro Corridor");
  const [address, setAddress] = useState("MG Road Metro Gate 2 Boulevard");
  const [latitude, setLatitude] = useState(12.97565);
  const [longitude, setLongitude] = useState(77.60688);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      name: "Sector 1: MG Road Metro",
      subArea: "Sector 1: MG Road Metro Corridor",
      address: "MG Road Metro Gate 2 Boulevard",
      lat: 12.97565,
      lon: 77.60688,
    },
    {
      name: "Sector 2: Jayanagar Hospital",
      subArea: "Sector 2: Jayanagar Civic Hospital Zone",
      address: "Emergency Gate 1, Jayanagar General Hospital",
      lat: 12.92512,
      lon: 77.59385,
    },
    {
      name: "Sector 3: Hebbal Flyover",
      subArea: "Sector 3: Hebbal Arterial Flyover",
      address: "Hebbal Flyover Fast Lane Descent",
      lat: 13.03585,
      lon: 77.59705,
    },
    {
      name: "Sector 4: Indiranagar",
      subArea: "Sector 4: Indiranagar 100ft Cross",
      address: "100ft Road, opposite KFC",
      lat: 12.9784,
      lon: 77.6408,
    },
  ];

  const hazardPhotoPresets = [
    {
      label: "Live Wire in Flood",
      url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80",
    },
    {
      label: "Deep Road Crater",
      url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    },
    {
      label: "Clogged Culvert Overflow",
      url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
    },
    {
      label: "Hospital Waste Spill",
      url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setSubArea(p.subArea);
    setAddress(p.address);
    setLatitude(p.lat);
    setLongitude(p.lon);
  };

  const handleAutoFillDemo = () => {
    setTitle("Exposed live wire sparking in knee-deep floodwater outside Metro Gate 2");
    setDescription(
      "URGENT: A roadside junction box has its door ripped open and live wires are submerged in standing stormwater right where commuters walk down from the metro escalator. Heavy arcing and smoke observed!"
    );
    setCategory("ELECTRICAL_HAZARD");
    setSubArea("Sector 1: MG Road Metro Corridor");
    setAddress("MG Road Metro Gate 2 Escalator Walkway");
    setLatitude(12.97561);
    setLongitude(77.60691);
    setImagePreview("https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80");
  };

  useEffect(() => {
    if (initialDemo) {
      handleAutoFillDemo();
    }
  }, [initialDemo]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSubmissionReceipt(null);

    try {
      const payload = {
        title,
        description,
        category,
        sub_area: subArea,
        address,
        latitude,
        longitude,
        image_url: imagePreview?.startsWith("http") ? imagePreview : null,
        image_base64: imageBase64,
      };

      const res = await fetch("/api/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.triageReceipt) {
        setSubmissionReceipt(data.triageReceipt);
      } else {
        setErrorMsg(data.error || "Failed to process citizen report intake");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "Network error submitting citizen report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* 1-Tap Judge Demo Scenario Button */}
      <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-obsidian-900 to-cyan-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-cyan-glow">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-tactical-cyan animate-spin" />
          <div>
            <div className="font-mono text-xs font-bold text-tactical-cyan">
              JUDGE 15-SECOND SPEED DEMO
            </div>
            <p className="text-[11px] text-slate-300">
              Auto-fill urgent flood + sparking feeder box scenario at MG Road Metro.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="px-3 py-1.5 rounded-lg bg-tactical-cyan text-obsidian-950 hover:bg-cyan-300 font-mono text-xs font-bold tracking-wider transition"
        >
          Auto-Fill Urgent Scenario
        </button>
      </div>

      {/* Main Intake Card */}
      <div className="rounded-xl border border-slate-800 bg-obsidian-900/95 p-5 sm:p-7 shadow-2xl reticle-corner">
        <div className="border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2 text-tactical-cyan font-mono text-xs font-semibold tracking-wider uppercase mb-1">
            <Camera className="w-3.5 h-3.5" />
            Stage 1 • Rapid Citizen Incident Intake (&lt;60 Seconds)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Report Civic Hazard or Infrastructure Failure
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Your report is processed in real time by our Gemini 2.5 Flash Triage Engine, checked against nearby complaints to prevent duplicate dispatch, and ranked by transparent life-safety math.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-tactical-crimson/20 border border-tactical-crimson/50 text-tactical-crimson text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* The Intake Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          {/* Issue Title */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1">
              Issue Summary / Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clogged culvert causing knee-deep waterlogging"
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tactical-cyan font-sans text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1">
              Detailed Field Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see: depth of water, size of crater, arcing electrical wires, blocked hospital access, etc."
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tactical-cyan font-sans text-xs"
            />
          </div>

          {/* Civic Category Selector */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1">
              Primary Civic Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CivicCategory)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan"
            >
              <option value="WATERLOGGING">WATERLOGGING (Flooding, Clogged Drains, Culvert Backups)</option>
              <option value="ROAD_DAMAGE">ROAD_DAMAGE (Potholes, Asphalt Craters, Collapsed Lanes)</option>
              <option value="ELECTRICAL_HAZARD">ELECTRICAL_HAZARD (Sparking Feeders, Exposed Live Wires)</option>
              <option value="WASTE_OVERFLOW">WASTE_OVERFLOW (Overflowing Municipal Dumpsters, Refuse Spills)</option>
              <option value="STREETLIGHT_OUTAGE">STREETLIGHT_OUTAGE (Dark Crossings, Broken Poles)</option>
              <option value="WATER_SUPPLY">WATER_SUPPLY (Ruptured Mains, Pipe Blowouts, Low Pressure)</option>
            </select>
          </div>

          {/* Location 1-Tap Presets */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Location Quick-Presets</span>
              <span className="text-slate-500 font-normal">Click to set coordinates</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`p-2 rounded-lg border text-left text-[11px] transition ${
                    subArea === p.subArea
                      ? "bg-slate-800 border-tactical-cyan text-tactical-cyan"
                      : "bg-obsidian-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold truncate">{p.name.split(":")[1]?.trim() || p.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Address & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 uppercase tracking-wider mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Opposite Metro Gate 2, MG Road"
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan font-sans text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1">
                Sector / Sub-Area
              </label>
              <input
                type="text"
                required
                value={subArea}
                onChange={(e) => setSubArea(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-tactical-cyan font-sans text-xs"
              />
            </div>
          </div>

          {/* Lat / Lon Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-obsidian-950 border border-slate-800">
            <div>
              <label className="block text-slate-400 text-[10px] uppercase mb-0.5">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full px-2 py-1 rounded bg-obsidian-900 border border-slate-700 text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] uppercase mb-0.5">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full px-2 py-1 rounded bg-obsidian-900 border border-slate-700 text-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Photo Attachment / Hazard Preset Picker */}
          <div>
            <label className="block text-slate-300 uppercase tracking-wider mb-1">
              Field Hazard Photo (Optional for Gemini Multimodal Analysis)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {/* File upload input */}
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>

              {/* Quick photo presets */}
              <div className="flex flex-wrap gap-1.5">
                {hazardPhotoPresets.map((hp) => (
                  <button
                    key={hp.label}
                    type="button"
                    onClick={() => {
                      setImagePreview(hp.url);
                      setImageBase64(null);
                    }}
                    className={`px-2 py-1.5 rounded border text-[10px] transition ${
                      imagePreview === hp.url
                        ? "bg-slate-800 border-tactical-cyan text-tactical-cyan"
                        : "bg-obsidian-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    📷 {hp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo preview thumbnail */}
            {imagePreview && (
              <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Field preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  className="absolute top-1 right-1 bg-obsidian-950/80 p-0.5 rounded text-slate-300 text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-tactical-cyan to-cyan-500 text-obsidian-950 hover:from-cyan-400 hover:to-cyan-300 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-cyan-glow"
            >
              <Sparkles className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
              <span>{isSubmitting ? "Triaging with Gemini 2.5 Flash..." : "Submit to Triage Engine"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live AI Triage Receipt Drawer / Modal */}
      {submissionReceipt && (
        <div className="rounded-xl border border-tactical-cyan/60 bg-slate-900/95 p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-tactical-emerald" />
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                AI TRIAGE RECEIPT GENERATED
              </h2>
            </div>
            <span className="font-mono text-xs text-tactical-cyan px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              TICKET #{submissionReceipt.reportId}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans">
            Your complaint was instantly ingested by the ASTRA-Grid Tactical engine. Here is how our AI categorized and prioritized your report:
          </p>

          {/* Receipt Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-obsidian-950 p-3 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">AI Category</span>
              <span className="text-tactical-cyan font-bold">{submissionReceipt.category}</span>
            </div>

            <div className="bg-obsidian-950 p-3 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Priority Score</span>
              <span
                className={`font-bold ${
                  submissionReceipt.priority_score >= 80
                    ? "text-tactical-crimson"
                    : submissionReceipt.priority_score >= 65
                    ? "text-tactical-amber"
                    : "text-tactical-cyan"
                }`}
              >
                {submissionReceipt.priority_score}/100 [{submissionReceipt.priority_level}]
              </span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-obsidian-950 p-3 rounded border border-slate-800 text-xs">
            <span className="text-tactical-cyan font-mono text-[10px] block uppercase font-bold mb-1">
              Executive AI Summary
            </span>
            <p className="text-slate-200 font-sans">{submissionReceipt.ai_summary}</p>
          </div>

          {/* Duplicate Match Status */}
          {submissionReceipt.is_likely_duplicate && (
            <div className="p-3 rounded bg-amber-950/20 border border-tactical-amber/40 text-xs font-mono text-tactical-amber flex items-start gap-2">
              <GitMerge className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Corroborating Citizen Duplicate Detected:</strong>
                <p className="text-slate-300 text-[11px] mt-0.5 font-sans">
                  {submissionReceipt.duplicate_reasoning} (Matched Ticket #{submissionReceipt.matched_duplicate_id}).
                  Both complaints are linked to prevent split crew dispatch and boost priority.
                </p>
              </div>
            </div>
          )}

          {/* AI Explanation of Ranking */}
          <div className="bg-obsidian-950 p-3 rounded border border-slate-800 text-xs">
            <span className="text-tactical-cyan font-mono text-[10px] block uppercase font-bold mb-1">
              Transparent Scoring Explanation
            </span>
            <p className="text-slate-300 font-sans italic text-[11px]">
              {submissionReceipt.ai_explanation}
            </p>
          </div>

          {/* 4-Factor Breakdown */}
          {submissionReceipt.priority_factors && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-obsidian-950 p-3 rounded border border-slate-800">
              <div>
                <span className="text-slate-400 block">Life Safety:</span>
                <span className="text-tactical-crimson font-bold">
                  {submissionReceipt.priority_factors.safetyRiskScore}/40
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Cascade Impact:</span>
                <span className="text-tactical-amber font-bold">
                  {submissionReceipt.priority_factors.cascadeImpactScore}/25
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Report Volume:</span>
                <span className="text-tactical-cyan font-bold">
                  {submissionReceipt.priority_factors.duplicateVolumeScore}/20
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Zone Sensitivity:</span>
                <span className="text-tactical-emerald font-bold">
                  {submissionReceipt.priority_factors.vulnerabilityScore}/15
                </span>
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs font-mono">
            <Link
              href={`/track?id=${submissionReceipt.reportId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-tactical-cyan text-obsidian-950 font-bold hover:bg-cyan-300 transition"
            >
              <span>Follow Progress in Live Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
            >
              View in Tactical Command Deck
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
