"use client";

import { useMemo, useState } from "react";
import { kenyaOutlinePath, lakeTurkanaPath, lakeVictoriaPath, project, MAP } from "@/lib/kenya";
import { useI18n } from "@/lib/i18n";

export interface CountyStat {
  county: string;
  lat: number;
  lng: number;
  count: number;
  avgSeverity: number;
  recent: number;
  topThreat: string | null;
}

function severityColor(avgSeverity: number): string {
  if (avgSeverity >= 4) return "#ff6b57";
  if (avgSeverity >= 2.9) return "#ffb454";
  if (avgSeverity >= 1.6) return "#f0b23e";
  return "#57a875";
}

const CITIES = [
  { name: "Nairobi", lat: -1.29, lng: 36.82 },
  { name: "Mombasa", lat: -4.05, lng: 39.67 },
  { name: "Kisumu", lat: -0.09, lng: 34.77 },
  { name: "Eldoret", lat: 0.52, lng: 35.27 },
  { name: "Garissa", lat: -0.45, lng: 39.65 },
];

export function KenyaMap({
  stats,
  alertedCounties = [],
  selected,
  onSelect,
}: {
  stats: CountyStat[];
  alertedCounties?: string[];
  selected?: string | null;
  onSelect?: (county: string | null) => void;
}) {
  const { t } = useI18n();
  const [hover, setHover] = useState<CountyStat | null>(null);

  const outline = useMemo(() => kenyaOutlinePath(), []);
  const turkana = useMemo(() => lakeTurkanaPath(), []);
  const victoria = useMemo(() => lakeVictoriaPath(), []);
  const maxCount = Math.max(1, ...stats.map((s) => s.count));

  const hoverPos = hover ? project(hover.lat, hover.lng) : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="w-full select-none">
        <defs>
          <radialGradient id="kenyaFill" cx="42%" cy="38%" r="85%">
            <stop offset="0%" stopColor="#1b2f24" />
            <stop offset="60%" stopColor="#122017" />
            <stop offset="100%" stopColor="#0c1510" />
          </radialGradient>
          <linearGradient id="alertGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb454" />
            <stop offset="100%" stopColor="#ff6b57" />
          </linearGradient>
        </defs>

        {/* faint lat/long grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`gv${i}`} x1={(MAP.width / 10) * (i + 1)} y1="0" x2={(MAP.width / 10) * (i + 1)} y2={MAP.height} stroke="#24352c" strokeWidth="0.5" strokeOpacity="0.35" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`gh${i}`} x1="0" y1={(MAP.height / 12) * (i + 1)} x2={MAP.width} y2={(MAP.height / 12) * (i + 1)} stroke="#24352c" strokeWidth="0.5" strokeOpacity="0.35" />
        ))}

        {/* country body */}
        <path d={outline} fill="url(#kenyaFill)" stroke="#3a5244" strokeWidth="1.6" strokeLinejoin="round" />
        <path d={outline} fill="none" stroke="#8fe6a8" strokeWidth="0.6" strokeOpacity="0.35" strokeLinejoin="round" transform="translate(0 1.5)" />

        {/* lakes */}
        <path d={turkana} fill="#16394a" stroke="#2e6b8a" strokeWidth="1" opacity="0.9" />
        <path d={victoria} fill="#16394a" stroke="#2e6b8a" strokeWidth="1" opacity="0.9" />

        {/* city anchors */}
        {CITIES.map((c) => {
          const p = project(c.lat, c.lng);
          return (
            <g key={c.name} opacity="0.55">
              <circle cx={p.x} cy={p.y} r="2" fill="#8fc0b0" />
              <text x={p.x + 5} y={p.y + 3.5} fill="#8fc0b0" fontSize="9.5" fontFamily="var(--font-body)" fontWeight="500">
                {c.name}
              </text>
            </g>
          );
        })}

        {/* county outbreak markers */}
        {stats.map((s) => {
          const p = project(s.lat, s.lng);
          const r = 4.5 + Math.sqrt(s.count / maxCount) * 15;
          const color = severityColor(s.avgSeverity);
          const isAlerted = alertedCounties.includes(s.county);
          const isSelected = selected === s.county;
          return (
            <g
              key={s.county}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(isSelected ? null : s.county)}
              className="cursor-pointer"
            >
              {/* heat halo */}
              <circle cx={p.x} cy={p.y} r={r * 1.9} fill={color} opacity="0.10" />
              <circle cx={p.x} cy={p.y} r={r * 1.35} fill={color} opacity="0.16" />
              {isAlerted && (
                <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke="url(#alertGlow)" strokeWidth="1.4">
                  <animate attributeName="r" values={`${r + 3};${r + 11}`} dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={color}
                fillOpacity={isSelected ? 0.95 : 0.82}
                stroke={hover?.county === s.county || isSelected ? "#f5f2e9" : "#0a100d"}
                strokeWidth={hover?.county === s.county || isSelected ? 1.8 : 1}
                style={{ transition: "r 0.25s, fill-opacity 0.25s" }}
              />
              <text
                x={p.x}
                y={p.y + 3.5}
                textAnchor="middle"
                fill="#0a100d"
                fontSize={Math.max(9, Math.min(13, r * 0.75))}
                fontFamily="var(--font-plex)"
                fontWeight="600"
                pointerEvents="none"
              >
                {s.count}
              </text>
            </g>
          );
        })}

        {/* hover tooltip */}
        {hover && hoverPos && (
          <g transform={`translate(${Math.min(Math.max(hoverPos.x + 14, 8), MAP.width - 218)} ${Math.max(hoverPos.y - 62, 8)})`} pointerEvents="none">
            <rect width="210" height="76" rx="10" fill="#0c1510" stroke="#3a5244" strokeWidth="1" opacity="0.97" />
            <text x="12" y="20" fill="#f5f2e9" fontSize="13" fontWeight="700" fontFamily="var(--font-dm)">
              {hover.county}
            </text>
            <text x="12" y="38" fill="#8fe6a8" fontSize="11" fontFamily="var(--font-plex)">
              {hover.count} {t("dash.map.det")} · sev {hover.avgSeverity.toFixed(1)}
            </text>
            {hover.topThreat && (
              <text x="12" y="55" fill="#ffb454" fontSize="10.5" fontFamily="var(--font-body)">
                {hover.topThreat.length > 30 ? hover.topThreat.slice(0, 30) + "…" : hover.topThreat}
              </text>
            )}
            <text x="12" y="69" fill="#8fc0b0" fontSize="9" fontFamily="var(--font-plex)">
              {hover.recent} {t("common.today") === "Today" ? "this week" : "wiki hii"}
            </text>
          </g>
        )}
      </svg>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-3 rounded-lg border border-night-line bg-night/80 px-3 py-2 text-[10px] font-heading text-mint-dim backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#57a875" }} /> low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#f0b23e" }} /> med
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ffb454" }} /> high
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff6b57" }} /> severe
        </span>
      </div>
    </div>
  );
}
