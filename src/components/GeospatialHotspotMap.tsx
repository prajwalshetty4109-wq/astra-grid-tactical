import React, { useState, useMemo, useRef } from "react";
import { CivicReport, HotspotCluster } from "@/lib/validators";
import {
  AlertTriangle,
  Zap,
  Building2,
} from "lucide-react";

interface GeospatialHotspotMapProps {
  reports: CivicReport[];
  clusters: HotspotCluster[];
  selectedReport: CivicReport | null;
  selectedClusterId: string | null;
  onSelectReport: (report: CivicReport) => void;
  onSelectCluster: (cluster: HotspotCluster) => void;
}

/**
 * Stage 3 (Reveal) Geospatial 3D Campus Blueprint Map.
 * Renders SVG isometric campus buildings, duplicate link vectors,
 * active multi-issue hotspot clusters, and interactive incident pins with priority badges.
 */
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute projection bounds
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

  // Project lat/lon to 1000x600 SVG coordinates
  const project = (lat: number, lon: number) => {
    const width = 1000;
    const height = 600;
    const padding = 60;

    const lonSpan = bounds.maxLon - bounds.minLon || 1;
    const latSpan = bounds.maxLat - bounds.minLat || 1;

    const x = padding + ((lon - bounds.minLon) / lonSpan) * (width - 2 * padding);
    const y = height - padding - ((lat - bounds.minLat) / latSpan) * (height - 2 * padding);

    return { x, y };
  };

  const filteredReports = useMemo(() => {
    if (activeLayer === "CRITICAL") {
      return reports.filter((r) => r.priority_level === "CRITICAL");
    }
    if (activeLayer === "DUPLICATES") {
      return reports.filter((r) => Boolean(r.duplicate_of_id) || (r.duplicate_count || 1) > 1);
    }
    return reports;
  }, [reports, activeLayer]);

  // Campus Building Blocks with coordinates and 3D architectural profiles
  const campusBuildings = [
    { name: "Science Block Wing B", lat: 12.9756, lon: 77.6068, code: "SCI-01" },
    { name: "Central Library Commons", lat: 12.9251, lon: 77.5938, code: "LIB-02" },
    { name: "Student Dorms Block C", lat: 13.0358, lon: 77.5970, code: "RES-03" },
    { name: "Engineering Wing", lat: 12.9784, lon: 77.6408, code: "ENG-04" },
    { name: "Main Cafeteria", lat: 12.9352, lon: 77.6245, code: "CAF-05" },
    { name: "Admin Hub", lat: 12.9841, lon: 77.7521, code: "ADM-06" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-white/15 bg-neutral-950 p-0 shadow-3d-card overflow-hidden flex flex-col"
      style={{ height: "620px" }}
    >
      {/* 3D Blueprint Header & Layer Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-white/10 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-white" aria-hidden="true" />
            <h2 className="font-mono text-sm font-bold tracking-wider text-white">
              CAMPUS 3D BLUEPRINT <span className="text-neutral-400 text-xs">[ACTIVE TELEMETRY]</span>
            </h2>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-neutral-400 px-2 py-0.5 rounded bg-black border border-white/10">
            CAMPUS GRID: 12.97°N / 77.59°E • MAIN QUAD
          </span>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 bg-black p-1 rounded-lg border border-white/10 text-xs font-mono" role="group" aria-label="Map Layer Filters">
          <button
            type="button"
            aria-label={`Show all reports (${reports.length})`}
            onClick={() => setActiveLayer("ALL")}
            className={`px-2.5 py-1 rounded transition ${
              activeLayer === "ALL"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            All ({reports.length})
          </button>
          <button
            type="button"
            aria-label="Filter critical hazard reports"
            onClick={() => setActiveLayer("CRITICAL")}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              activeLayer === "CRITICAL"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            Critical
          </button>
          <button
            type="button"
            aria-label={`Filter building clusters (${clusters.length})`}
            onClick={() => setActiveLayer("CLUSTERS")}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              activeLayer === "CLUSTERS"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Zap className="w-3 h-3" aria-hidden="true" />
            Clusters ({clusters.length})
          </button>
          <button
            type="button"
            aria-label="Filter duplicate reports"
            onClick={() => setActiveLayer("DUPLICATES")}
            className={`px-2.5 py-1 rounded transition ${
              activeLayer === "DUPLICATES"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Duplicates
          </button>
        </div>
      </div>

      {/* Interactive 3D Perspective Canvas */}
      <div className="relative flex-1 bg-black bg-campus-grid select-none overflow-hidden">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Geospatial interactive 3D map showing campus facilities and active crisis hotspots"
        >
          <title>Campus 3D Blueprint Map</title>
          {/* Subtle 3D Isometric Coordinate Grid lines */}
          <g className="opacity-15 pointer-events-none" stroke="#FFFFFF" strokeWidth="0.75" fill="none" aria-hidden="true">
            <line x1="500" y1="20" x2="500" y2="580" strokeDasharray="4,4" />
            <line x1="50" y1="300" x2="950" y2="300" strokeDasharray="4,4" />
            <circle cx="500" cy="300" r="120" strokeDasharray="2,4" />
            <circle cx="500" cy="300" r="240" strokeDasharray="3,6" />
          </g>

          {/* Isometric 3D Campus Building Footprints */}
          {campusBuildings.map((bldg) => {
            const pos = project(bldg.lat, bldg.lon);
            return (
              <g key={bldg.code} className="pointer-events-none" aria-hidden="true">
                {/* 3D Extruded Building Block Shadow */}
                <rect
                  x={pos.x - 38}
                  y={pos.y - 18}
                  width="76"
                  height="44"
                  rx="6"
                  fill="rgba(255, 255, 255, 0.04)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1.2"
                />
                {/* 3D Top Elevation Layer */}
                <rect
                  x={pos.x - 35}
                  y={pos.y - 25}
                  width="70"
                  height="40"
                  rx="4"
                  fill="#121212"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth="1.2"
                />
                <text
                  x={pos.x}
                  y={pos.y - 10}
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {bldg.code}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  fill="#737373"
                  fontSize="7.5"
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                >
                  {bldg.name.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* Duplicate Link Vectors */}
          {(activeLayer === "ALL" || activeLayer === "DUPLICATES") && (
            <g className="duplicate-links" aria-hidden="true">
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
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />
                );
              })}
            </g>
          )}

          {/* Hotspot Building Clusters */}
          {(activeLayer === "ALL" || activeLayer === "CLUSTERS") && (
            <g className="clusters" aria-label="Campus Building Hotspot Clusters">
              {clusters.map((cluster) => {
                const pos = project(cluster.centroid.latitude, cluster.centroid.longitude);
                const isSelected = selectedClusterId === cluster.id;
                const radius = Math.min(65, Math.max(38, cluster.radiusMeters * 0.25));

                return (
                  <g
                    key={cluster.id}
                    onClick={() => onSelectCluster(cluster)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Cluster ${cluster.id}: ${cluster.title}, composite risk score ${cluster.compositeRiskScore}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onSelectCluster(cluster);
                      }
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Multi-layered 3D cluster boundary */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={cluster.criticalCount > 0 ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.04)"}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? "2.5" : "1.2"}
                      strokeDasharray={isSelected ? "none" : "4,3"}
                      className={cluster.criticalCount > 0 ? "animate-pulse" : ""}
                    />
                    {/* Cluster Badge */}
                    <rect
                      x={pos.x - 48}
                      y={pos.y - radius - 20}
                      width="96"
                      height="18"
                      rx="4"
                      fill="#000000"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - radius - 8}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
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

          {/* Incident Pins */}
          <g className="report-pins" aria-label="Campus Incident Pins">
            {filteredReports.map((report) => {
              const pos = project(report.latitude, report.longitude);
              const isSelected = selectedReport?.id === report.id;
              const isCritical = report.priority_level === "CRITICAL";

              return (
                <g
                  key={report.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectReport(report)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Report #${report.id}: ${report.title}, priority ${report.priority_score}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectReport(report);
                    }
                  }}
                  onMouseEnter={() => setHoveredReport(report)}
                  onMouseLeave={() => setHoveredReport(null)}
                  className="cursor-pointer transition-transform hover:scale-125"
                >
                  {/* Selection 3D Specular Ring */}
                  {isSelected && (
                    <circle
                      r="12"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeDasharray="2,2"
                      className="animate-spin"
                      style={{ animationDuration: "8s" }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Core 3D Pin */}
                  <circle
                    r={isSelected ? "6.5" : isCritical ? "5.5" : "4"}
                    fill={isCritical ? "#FFFFFF" : isSelected ? "#FFFFFF" : "#737373"}
                    stroke="#000000"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  />

                  {/* Score Label if Critical */}
                  {isCritical && (
                    <text
                      x="0"
                      y="-8"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                      aria-hidden="true"
                    >
                      {report.priority_score}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* 3D Popover for Hover/Selection */}
        {(hoveredReport || selectedReport) && (
          <aside aria-label="Selected incident preview" className="absolute bottom-4 left-4 max-w-sm rounded-xl bg-neutral-950/95 border border-white/20 p-3.5 shadow-3d-card backdrop-blur-md z-20 reticle-corner-white">
            {(() => {
              const r = hoveredReport || selectedReport!;
              const isCrit = r.priority_level === "CRITICAL";
              return (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-white">
                      #{r.id} • {r.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCrit
                          ? "bg-white text-black"
                          : "bg-neutral-800 text-neutral-300 border border-white/10"
                      }`}
                    >
                      SCORE: {r.priority_score}/100
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                    {r.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mb-2">
                    {r.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-white/10 pt-1.5">
                    <span>{r.sub_area} • {r.address}</span>
                    <span>DUPES: {r.duplicate_count || 1}</span>
                  </div>
                </div>
              );
            })()}
          </aside>
        )}

        {/* Map Legend */}
        <aside aria-label="Priority Score Legend" className="absolute bottom-4 right-4 bg-black/90 border border-white/15 p-3 rounded-xl text-[10px] font-mono text-neutral-300 flex flex-col gap-1.5 shadow-3d-card backdrop-blur-md">
          <div className="text-neutral-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">
            PRIORITY MATRIX
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-400" aria-hidden="true" />
            <span>CRITICAL (&ge; 80 pts)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" aria-hidden="true" />
            <span>HIGH (65–79 pts)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" aria-hidden="true" />
            <span>MEDIUM (40–64 pts)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" aria-hidden="true" />
            <span>LOW / RESOLVED (&lt; 40)</span>
          </div>
        </aside>
      </div>
    </div>
  );
};
