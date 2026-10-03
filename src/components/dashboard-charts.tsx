"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CropIcon } from "@/components/crop-icon";
import type { CropKey } from "@/lib/knowledge";

/* ---------- animated number ---------- */
export function StatNumber({ value, className = "" }: { value: number; className?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={`font-numeric ${className}`}>{shown.toLocaleString()}</span>;
}

/* ---------- 12-week trend chart ---------- */
export interface Bucket {
  label: string;
  disease: number;
  pest: number;
  healthy: number;
}

const tooltipStyle = {
  backgroundColor: "#0c1510",
  border: "1px solid #24352c",
  borderRadius: "10px",
  fontSize: 12,
  fontFamily: "var(--font-plex)",
  color: "#f5f2e9",
};

export function TrendChart({ buckets }: { buckets: Bucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={buckets} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#57a875" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#57a875" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0b23e" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#f0b23e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#24352c" strokeDasharray="3 5" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#57a875", fontSize: 10, fontFamily: "var(--font-plex)" }}
          axisLine={{ stroke: "#24352c" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#57a875", fontSize: 10, fontFamily: "var(--font-plex)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#3a5244" }} />
        <Area type="monotone" dataKey="disease" name="disease" stroke="#8fe6a8" strokeWidth={2} fill="url(#dGrad)" />
        <Area type="monotone" dataKey="pest" name="pest" stroke="#f0b23e" strokeWidth={2} fill="url(#pGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---------- top threats custom bars ---------- */
export interface ThreatRow {
  key: string;
  nameEn: string;
  nameSw: string;
  type: string;
  count: number;
  avgSeverity: number;
}

export function ThreatBars({ threats, lang }: { threats: ThreatRow[]; lang: "en" | "sw" }) {
  const max = Math.max(1, ...threats.map((t) => t.count));
  return (
    <div className="space-y-3">
      {threats.map((th, i) => (
        <div key={th.key} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-numeric text-[10px] text-mint-dim/70">{String(i + 1).padStart(2, "0")}</span>
              <span className="truncate text-[13px] font-heading font-medium text-paper-soft">
                {lang === "sw" ? th.nameSw : th.nameEn}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-heading font-semibold uppercase tracking-wide ${
                  th.type === "pest" ? "bg-maize/15 text-maize" : "bg-mint/10 text-mint-dim"
                }`}
              >
                {th.type}
              </span>
            </div>
            <span className="font-numeric text-xs text-mint">{th.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-night-line/60">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(th.count / max) * 100}%`,
                background:
                  th.avgSeverity >= 4
                    ? "linear-gradient(90deg,#ffb454,#ff6b57)"
                    : th.avgSeverity >= 3
                      ? "linear-gradient(90deg,#f0b23e,#ffb454)"
                      : "linear-gradient(90deg,#57a875,#8fe6a8)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- crop mix donut ---------- */
export function CropDonut({ byCrop }: { byCrop: { crop: string; count: number }[] }) {
  const total = Math.max(1, byCrop.reduce((s, c) => s + c.count, 0));
  const colors: Record<string, string> = {
    maize: "#f0b23e",
    beans: "#8fe6a8",
    tomato: "#ff6b57",
    potato: "#b9a6f2",
    cassava: "#f6d489",
  };
  let acc = 0;
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg width="118" height="118" viewBox="0 0 118 118" className="-rotate-90 shrink-0">
        <circle cx="59" cy="59" r={r} fill="none" stroke="#24352c" strokeWidth="13" opacity="0.5" />
        {byCrop.map((b) => {
          const frac = b.count / total;
          const dash = frac * c;
          const offset = -acc * c;
          acc += frac;
          return (
            <circle
              key={b.crop}
              cx="59"
              cy="59"
              r={r}
              fill="none"
              stroke={colors[b.crop] || "#8fc0b0"}
              strokeWidth="13"
              strokeDasharray={`${Math.max(0, dash - 2)} ${c}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2">
        {byCrop
          .sort((a, b) => b.count - a.count)
          .map((b) => (
            <div key={b.crop} className="flex items-center gap-2">
              <span className="text-mint" style={{ color: colors[b.crop] }}>
                <CropIcon crop={b.crop as CropKey} className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-heading capitalize text-paper-soft/90">{b.crop}</span>
              <span className="ml-auto font-numeric text-[11px] text-mint-dim">
                {Math.round((b.count / total) * 100)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
