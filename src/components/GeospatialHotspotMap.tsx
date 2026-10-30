import React, { useState, useMemo, useRef, useEffect } from "react";
import { CivicReport, HotspotCluster } from "@/lib/validators";
import {
  Maximize2,
  Minimize2,
  Crosshair,
  Layers,
  AlertTriangle,
  Zap,
  Filter,
  Eye,
  Info,
  Compass,
} from "lucide-react";

interface GeospatialHotspotMapProps {
  reports: CivicReport[];
  clusters: HotspotCluster[];
  selectedReport: CivicReport | null;
  selectedClusterId: string | null;
  onSelectReport: (report: CivicReport) => void;
  onSelectCluster: (cluster: HotspotCluster) => void;
}

export const GeospatialHotspotMap: React.FC<GeospatialHotspotMapProps> = ({
  reports,
  clusters,
  selectedReport,
  selectedClusterId,
  onSelectReport,
  onSelectCluster,
}) => {
  const [activeLayer, setActiveLayer] = useState<"ALL" | "CRITICAL" | "DUPLICATES" | "CLUSTERS">("ALL");
  const [hoveredReport, setHoveredReport] = useState<CivicReport | null>(null);
  const [radarSweeping, setRadarSweeping] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute bounding box for projection
  const bounds = useMemo(() => {
    if (reports.length === 0) {
      return { minLat: 12.92, maxLat: 13.04, minLon: 77.58, maxLon: 77.76 };
    }
    const lats = reports.map((r) => r.latitude);
    const lons = reports.map((r) => r.longitude);
    return {
      minLat: Math.min(...lats) - 0.01,
      maxLat: Math.max(...lats) + 0.01,
      minLon: Math.min(...lons) - 0.01,
      maxLon: Math.max(...lons) + 0.01,
    };
  }, [reports]);

  // Project geographic coordinates to SVG 1000x600 viewBox
  const project = (lat: number, lon: number) => {
    const width = 1000;
    const height = 600;
    const padding = 50;

    const lonSpan = bounds.maxLon - bounds.minLon || 1;
    const latSpan = bounds.maxLat - bounds.minLat || 1;

    // Invert lat for SVG y-axis
    const x = padding + ((lon - bounds.minLon) / lonSpan) * (width - 2 * padding);
    const y = height - padding - ((lat - bounds.minLat) / latSpan) * (height - 2 * padding);

    return { x, y };
  };

  // Filter reports based on active layer
  const filteredReports = useMemo(() => {
    if (activeLayer === "CRITICAL") {
      return reports.filter((r) => r.priority_level === "CRITICAL");
    }
    if (activeLayer === "DUPLICATES") {
      return reports.filter((r) => Boolean(r.duplicate_of_id) || (r.duplicate_count || 1) > 1);
    }
    return reports;
  }, [reports, activeLayer]);

  // Sector labels with center coordinates
  const sectors = [
    { name: "Sector 1: MG Road Metro", lat: 12.9756, lon: 77.6068, code: "SEC-01" },
    { name: "Sector 2: Jayanagar Hospital", lat: 12.9251, lon: 77.5938, code: "SEC-02" },
    { name: "Sector 3: Hebbal Arterial Flyover", lat: 13.0358, lon: 77.5970, code: "SEC-03" },
    { name: "Sector 4: Indiranagar 100ft", lat: 12.9784, lon: 77.6408, code: "SEC-04" },
    { name: "Sector 5: Koramangala Drain Belt", lat: 12.9352, lon: 77.6245, code: "SEC-05" },
    { name: "Sector 6: Whitefield Transit Hub", lat: 12.9841, lon: 77.7521, code: "SEC-06" },
  ];

  const getPinColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "#EF4444"; // Emergency Crimson
      case "HIGH":
        return "#F59E0B"; // Hazard Amber
      case "MEDIUM":
        return "#00F0FF"; // Tactical Cyan
      case "LOW":
      default:
        return "#10B981"; // Civic Emerald
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-slate-800/90 bg-obsidian-950/90 overflow-hidden shadow-2xl flex flex-col"
      style={{ height: "620px" }}
    >
      {/* Tactical Map Header & Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-obsidian-900/90 border-b border-slate-800/80 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-tactical-cyan animate-spin" style={{ animationDuration: "12s" }} />
            <h2 className="font-mono text-sm font-semibold tracking-wider text-slate-200">
              GEOSPATIAL HOTSPOT RADAR <span className="text-tactical-cyan text-xs">[LIVE TELEMETRY]</span>
            </h2>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            GRID: 12.97°N / 77.59°E • BGR
          </span>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 bg-obsidian-950 p-1 rounded-lg border border-slate-800/80 text-xs font-mono">
          <button
            onClick={() => setActiveLayer("ALL")}
            className={`px-2.5 py-1 rounded transition ${
              activeLayer === "ALL"
                ? "bg-slate-800 text-tactical-cyan border border-tactical-cyan/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setActiveLayer("CRITICAL")}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              activeLayer === "CRITICAL"
                ? "bg-tactical-crimson/20 text-tactical-crimson border border-tactical-crimson/50"
                : "text-slate-400 hover:text-tactical-crimson"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Critical
          </button>
          <button
            onClick={() => setActiveLayer("CLUSTERS")}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              activeLayer === "CLUSTERS"
                ? "bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/50"
                : "text-slate-400 hover:text-tactical-amber"
            }`}
          >
            <Zap className="w-3 h-3" />
            Clusters ({clusters.length})
          </button>
          <button
            onClick={() => setActiveLayer("DUPLICATES")}
            className={`px-2.5 py-1 rounded transition ${
              activeLayer === "DUPLICATES"
                ? "bg-slate-800 text-tactical-cyan border border-tactical-cyan/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Duplicates
          </button>
        </div>
      </div>

      {/* SVG Canvas Tactical Coordinate Radar */}
      <div className="relative flex-1 bg-obsidian-950 bg-tactical-grid select-none overflow-hidden">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Tactical Circular Radar Rings */}
          <g className="opacity-25 pointer-events-none" stroke="#00F0FF" strokeWidth="0.75" fill="none">
            <circle cx="500" cy="300" r="100" strokeDasharray="3,3" />
            <circle cx="500" cy="300" r="200" strokeDasharray="4,4" />
            <circle cx="500" cy="300" r="280" />
            <line x1="500" y1="20" x2="500" y2="580" strokeDasharray="2,4" />
            <line x1="50" y1="300" x2="950" y2="300" strokeDasharray="2,4" />
          </g>

          {/* Sector Marker Boundaries */}
          {sectors.map((sec) => {
            const pos = project(sec.lat, sec.lon);
            return (
              <g key={sec.code} className="pointer-events-none">
                <circle cx={pos.x} cy={pos.y} r="45" fill="rgba(0, 240, 255, 0.02)" stroke="rgba(0, 240, 255, 0.15)" strokeDasharray="2,2" />
                <text
                  x={pos.x}
                  y={pos.y - 48}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  [{sec.code}] {sec.name.split(":")[1]?.trim()}
                </text>
              </g>
            );
          })}

          {/* Duplicate Link Vectors (lines connecting duplicate tickets to parent) */}
          {(activeLayer === "ALL" || activeLayer === "DUPLICATES") && (
            <g className="duplicate-links">
              {reports.map((report) => {
                if (!report.duplicate_of_id) return null;
                const parent = reports.find((r) => r.id === report.duplicate_of_id);
                if (!parent) return null;

                const p1 = project(report.latitude, report.longitude);
                const p2 = project(parent.latitude, parent.longitude);

                return (
                  <line
                    key={`link-${report.id}-${parent.id}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                );
              })}
            </g>
          )}

          {/* Hotspot Cluster Rings */}
          {(activeLayer === "ALL" || activeLayer === "CLUSTERS") && (
            <g className="clusters">
              {clusters.map((cluster) => {
                const pos = project(cluster.centroid.latitude, cluster.centroid.longitude);
                const isSelected = selectedClusterId === cluster.id;
                const radius = Math.min(65, Math.max(35, cluster.radiusMeters * 0.25));

                return (
                  <g
                    key={cluster.id}
                    onClick={() => onSelectCluster(cluster)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing hazard ring */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={cluster.criticalCount > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)"}
                      stroke={cluster.criticalCount > 0 ? "#EF4444" : "#F59E0B"}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      strokeDasharray={isSelected ? "none" : "4,3"}
                      className={cluster.criticalCount > 0 ? "animate-pulse" : ""}
                    />
                    {/* Cluster label */}
                    <rect
                      x={pos.x - 45}
                      y={pos.y - radius - 20}
                      width="90"
                      height="16"
                      rx="3"
                      fill="#0F1420"
                      stroke={cluster.criticalCount > 0 ? "#EF4444" : "#F59E0B"}
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - radius - 9}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {cluster.id} ({cluster.reportCount} RPTS)
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Report Incident Pins */}
          <g className="report-pins">
            {filteredReports.map((report) => {
              const pos = project(report.latitude, report.longitude);
              const isSelected = selectedReport?.id === report.id;
              const isCritical = report.priority_level === "CRITICAL";
              const pinColor = getPinColor(report.priority_level);

              return (
                <g
                  key={report.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectReport(report)}
                  onMouseEnter={() => setHoveredReport(report)}
                  onMouseLeave={() => setHoveredReport(null)}
                  className="cursor-pointer transition-transform hover:scale-125"
                >
                  {/* Selection / Critical glow */}
                  {(isSelected || isCritical) && (
                    <circle
                      r="12"
                      fill="none"
                      stroke={pinColor}
                      strokeWidth="1.5"
                      opacity={isSelected ? "0.9" : "0.5"}
                      className={isCritical ? "animate-ping" : ""}
                      style={{ animationDuration: "3s" }}
                    />
                  )}

                  {/* Base pin */}
                  <circle
                    r={isSelected ? "6" : isCritical ? "5" : "4"}
                    fill={pinColor}
                    stroke="#07090E"
                    strokeWidth="1.5"
                  />

                  {/* Monospace score label if critical */}
                  {isCritical && (
                    <text
                      x="0"
                      y="-8"
                      fill={pinColor}
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {report.priority_score}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover / Selection Interactive Popover */}
        {(hoveredReport || selectedReport) && (
          <div className="absolute bottom-4 left-4 max-w-sm rounded-lg bg-obsidian-850/95 border border-slate-700/90 p-3 shadow-2xl backdrop-blur-md z-20 reticle-corner">
            {(() => {
              const r = hoveredReport || selectedReport!;
              const isCrit = r.priority_level === "CRITICAL";
              return (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-tactical-cyan">
                      #{r.id} • {r.category}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCrit
                          ? "bg-tactical-crimson/20 text-tactical-crimson border border-tactical-crimson/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      SCORE: {r.priority_score}/100
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                    {r.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                    {r.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1.5">
                    <span>{r.address.split(",")[0]}</span>
                    <span>DUPES: {r.duplicate_count || 1}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Map Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-obsidian-900/90 border border-slate-800/90 p-2.5 rounded-lg text-[10px] font-mono text-slate-300 flex flex-col gap-1.5 shadow-xl backdrop-blur-sm">
          <div className="text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">
            PRIORITY MATRIX
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-crimson" />
            <span>CRITICAL (Score &ge; 80)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-amber" />
            <span>HIGH (Score 65–79)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-cyan" />
            <span>MEDIUM (Score 40–64)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-emerald" />
            <span>LOW / RESOLVED (&lt; 40)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
