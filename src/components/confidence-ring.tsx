"use client";

import { useEffect, useState } from "react";

/** Animated SVG confidence gauge — numeric readout in IBM Plex Mono. */
export function ConfidenceRing({
  value,
  size = 128,
  dark = false,
}: {
  value: number;
  size?: number;
  dark?: boolean;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (shown / 100) * c;
  const color = shown >= 85 ? "#43a35f" : shown >= 70 ? "#f0b23e" : "#d95d39";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={dark ? "stroke-night-line" : "stroke-ink/10"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-numeric font-semibold leading-none ${dark ? "text-mint" : "text-ink"}`} style={{ fontSize: size * 0.24 }}>
          {shown}
          <span style={{ fontSize: size * 0.13 }}>%</span>
        </span>
        <span className={`mt-1 text-[10px] font-heading font-medium uppercase tracking-[0.14em] ${dark ? "text-mint-dim" : "text-ink-soft/70"}`}>
          conf.
        </span>
      </div>
    </div>
  );
}
