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
  Building2,
  Cpu,
} from "lucide-react";

interface CitizenCaptureFormProps {
  initialDemo?: boolean;
}

export const CitizenCaptureForm: React.FC<CitizenCaptureFormProps> = ({ initialDemo = false }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CivicCategory>("PLUMBING");
  const [subArea, setSubArea] = useState("Science Block Wing B");
  const [address, setAddress] = useState("Room 304, 3rd Floor Lab Corridor");
  const [latitude, setLatitude] = useState(12.97565);
  const [longitude, setLongitude] = useState(77.60688);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      name: "Science Block Wing B",
      subArea: "Science Block Wing B",
      address: "Room 304, 3rd Floor Chem Lab",
      lat: 12.97565,
      lon: 77.60688,
    },
    {
      name: "Central Library Commons",
      subArea: "Central Library Commons",
      address: "2nd Floor Main Study Hall",
      lat: 12.92512,
      lon: 77.59385,
    },
    {
      name: "Student Dorms Block C",
      subArea: "Student Dorms Block C",
      address: "4th Floor Shower Bay & Lounge",
      lat: 13.03585,
      lon: 77.59705,
    },
    {
      name: "Engineering Wing",
      subArea: "Engineering Wing",
      address: "Lecture Hall 102 Podium",
      lat: 12.9784,
      lon: 77.6408,
    },
    {
      name: "Main Cafeteria",
      subArea: "Main Cafeteria",
      address: "Drink Station 2, Dining Hall",
      lat: 12.9352,
      lon: 77.6245,
    },
    {
      name: "Admin Hub",
      subArea: "Admin Hub",
      address: "Registrar Window 3, 1st Floor",
      lat: 12.9841,
      lon: 77.7521,
    },
  ];

  const hazardPhotoPresets = [
    {
      label: "Lab Water Leak",
      url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    },
    {
      label: "Sparking Lab Outlet",
      url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80",
    },
    {
      label: "Offline Wi-Fi AP",
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    },
    {
      label: "Broken AC Ceiling Vent",
      url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setSubArea(p.subArea);
    setAddress(p.address);
    setLatitude(p.lat);
    setLongitude(p.lon);
  };

  const handleAutoFillDemo = () => {
    setTitle("Overhead ceiling pipe rupture leaking onto lab electronics and sparking outlet");
    setDescription(
      "URGENT: Chilled water pipe in Science Block Room 304 has burst open. Pressurized water is dripping directly into wall power outlets and calibrated spectrometry equipment. Sparks and smoke visible!"
    );
    setCategory("ELECTRICAL");
    setSubArea("Science Block Wing B");
    setAddress("Room 304, East Wall Bench 3, Science Block");
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
        setErrorMsg(data.error || "Failed to process campus report intake");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "Network error submitting campus report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* 1-Tap Judge Demo Scenario Button */}
      <div className="p-4 rounded-xl border border-white/20 bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3d-card">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-white animate-spin" />
          <div>
            <div className="font-mono text-xs font-bold text-white">
              JUDGE 15-SECOND SPEED DEMO
            </div>
            <p className="text-[11px] text-neutral-400">
              Auto-fill urgent Science Lab water leak & sparking outlet scenario.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold tracking-wider transition shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
        >
          Auto-Fill Urgent Scenario
        </button>
      </div>

      {/* Main Campus Intake Card */}
      <div className="rounded-2xl border border-white/15 bg-neutral-950 p-6 sm:p-8 shadow-3d-card reticle-corner-white">
        <div className="border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold tracking-wider uppercase mb-1">
            <Camera className="w-3.5 h-3.5" />
            Stage 1 • Rapid Campus Incident Intake (&lt;60 Seconds)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Report Campus Facility or Equipment Failure
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Your ticket is analyzed by Gemini 2.5 Flash, cross-checked against adjacent building complaints to prevent duplicate crew dispatches, and prioritized by transparent safety and academic impact math.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* The Intake Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          {/* Issue Title */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
              Issue Headline / Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chilled water pipe leaking over lab equipment"
              className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white font-sans text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
              Detailed Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue: water volume, sparking wires, room temperature, network AP status, student safety hazard, etc."
              className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white font-sans text-xs"
            />
          </div>

          {/* Facility Category Selector */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
              Facility Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CivicCategory)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white focus:outline-none focus:border-white text-xs"
            >
              <option value="PLUMBING">PLUMBING (Pipe Leaks, Restroom Drains & Chilled Water Risers)</option>
              <option value="ELECTRICAL">ELECTRICAL (Sparking Sockets, Breakers & High-Voltage Lab Power)</option>
              <option value="IT_INFRA">IT_INFRA (Wi-Fi Access Points, Classroom AV & Network Switches)</option>
              <option value="HVAC">HVAC (Cooling Chillers, Lab Ventilation & Aircon Blowers)</option>
              <option value="SANITATION">SANITATION (Trash Chutes, Pest Control, Refuse & Disinfection)</option>
              <option value="FURNITURE">FURNITURE (Classroom Chairs, Desks, Doors, Locks & Podium Hardware)</option>
            </select>
          </div>

          {/* Location Quick Presets */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1.5 font-semibold flex items-center justify-between">
              <span>Campus Building Quick-Presets</span>
              <span className="text-neutral-500 font-normal">Click to set location</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`p-2.5 rounded-lg border text-left text-[11px] transition ${
                    subArea === p.subArea
                      ? "bg-white text-black border-white font-bold shadow-sm"
                      : "bg-black border-white/10 text-neutral-400 hover:text-white hover:border-white/25"
                  }`}
                >
                  <div className="truncate">{p.name}</div>
                  <div className="text-[10px] opacity-70 truncate">{p.address}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Building & Room Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                Room / Floor Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Room 304, 3rd Floor Lab Corridor"
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white focus:outline-none focus:border-white font-sans text-xs"
              />
            </div>
            <div>
              <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
                Campus Building Wing
              </label>
              <input
                type="text"
                required
                value={subArea}
                onChange={(e) => setSubArea(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white focus:outline-none focus:border-white font-sans text-xs"
              />
            </div>
          </div>

          {/* Coordinate Telemetry */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-black border border-white/10">
            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-0.5">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full px-2 py-1 rounded bg-neutral-900 border border-white/15 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-0.5">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full px-2 py-1 rounded bg-neutral-900 border border-white/15 text-white text-xs"
              />
            </div>
          </div>

          {/* Photo Attachment */}
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider mb-1 font-semibold">
              Hazard Photo (Optional for Gemini Multimodal Analysis)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-white text-xs transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
                <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </label>

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
                        ? "bg-white text-black border-white font-bold"
                        : "bg-black border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    📷 {hp.label}
                  </button>
                ))}
              </div>
            </div>

            {imagePreview && (
              <div className="mt-2.5 relative w-32 h-20 rounded-lg overflow-hidden border border-white/20 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Field preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                  className="absolute top-1 right-1 bg-black/80 px-1 rounded text-white text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-sm tracking-wider hover:bg-neutral-200 transition flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,255,255,0.3)]"
            >
              <Sparkles className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
              <span>{isSubmitting ? "Triaging with Gemini 2.5 Flash..." : "Submit to Triage Engine"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live AI Triage Receipt */}
      {submissionReceipt && (
        <div className="rounded-2xl border border-white/30 bg-neutral-950 p-6 sm:p-7 shadow-3d-card flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <h2 className="font-mono text-base font-bold text-white tracking-wide">
                AI TRIAGE RECEIPT GENERATED
              </h2>
            </div>
            <span className="font-mono text-xs text-white px-2.5 py-1 rounded bg-neutral-900 border border-white/20">
              TICKET #{submissionReceipt.reportId}
            </span>
          </div>

          <p className="text-xs text-neutral-300 font-sans">
            Your complaint was instantly ingested by CampusFix. Here is how our AI categorized, duplicate-checked, and prioritized your report:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-neutral-900 p-3 rounded-lg border border-white/10">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="text-white font-bold">{submissionReceipt.category}</span>
            </div>

            <div className="bg-neutral-900 p-3 rounded-lg border border-white/10">
              <span className="text-neutral-400 block text-[10px] uppercase font-bold">Priority Score</span>
              <span className="text-white font-extrabold">
                {submissionReceipt.priority_score}/100 [{submissionReceipt.priority_level}]
              </span>
            </div>
          </div>

          <div className="bg-neutral-900 p-3 rounded-lg border border-white/10 text-xs">
            <span className="text-white font-mono text-[10px] block uppercase font-bold mb-1">
              Executive AI Summary
            </span>
            <p className="text-neutral-200 font-sans">{submissionReceipt.ai_summary}</p>
          </div>

          {submissionReceipt.is_likely_duplicate && (
            <div className="p-3 rounded-lg bg-neutral-900 border border-white/25 text-xs font-mono text-white flex items-start gap-2">
              <GitMerge className="w-4 h-4 mt-0.5 shrink-0 text-white" />
              <div>
                <strong>Corroborating Student Report Detected:</strong>
                <p className="text-neutral-400 text-[11px] mt-0.5 font-sans">
                  {submissionReceipt.duplicate_reasoning} (Matched Ticket #{submissionReceipt.matched_duplicate_id}). Both tickets linked to prevent duplicate crew dispatches.
                </p>
              </div>
            </div>
          )}

          <div className="bg-neutral-900 p-3 rounded-lg border border-white/10 text-xs">
            <span className="text-white font-mono text-[10px] block uppercase font-bold mb-1">
              Transparent Scoring Explanation
            </span>
            <p className="text-neutral-300 font-sans italic text-[11px]">
              {submissionReceipt.ai_explanation}
            </p>
          </div>

          {submissionReceipt.priority_factors && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-neutral-900 p-3 rounded-lg border border-white/10">
              <div>
                <span className="text-neutral-400 block">Life Safety:</span>
                <span className="text-white font-bold">
                  {submissionReceipt.priority_factors.safetyRiskScore}/40
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Academic Cascade:</span>
                <span className="text-white font-bold">
                  {submissionReceipt.priority_factors.cascadeImpactScore}/25
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Student Volume:</span>
                <span className="text-white font-bold">
                  {submissionReceipt.priority_factors.duplicateVolumeScore}/20
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block">Zone Sensitivity:</span>
                <span className="text-white font-bold">
                  {submissionReceipt.priority_factors.vulnerabilityScore}/15
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs font-mono">
            <Link
              href={`/track?id=${submissionReceipt.reportId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 transition shadow-sm"
            >
              <span>Follow Progress in Student Tracker</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white border border-white/10 transition"
            >
              View in Campus Deck
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
