"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { CropIcon } from "@/components/crop-icon";
import { CROPS, type CropKey } from "@/lib/knowledge";
import { getDeviceId, getPending, type PendingRecord } from "@/lib/offline";
import {
  ScanLine,
  ClipboardList,
  Bug,
  FlaskConical,
  Leaf,
  CloudUpload,
  Clock,
  ChevronRight,
} from "lucide-react";

interface Row {
  id: string;
  crop: string;
  detectionType: string;
  nameEn: string;
  nameSw: string;
  latinName: string | null;
  confidence: number;
  severity: number;
  county: string;
  source: string;
  imageData: string | null;
  createdAt: string;
}

function TypeGlyph({ type }: { type: string }) {
  if (type === "pest") return <Bug className="h-4 w-4 text-clay" />;
  if (type === "disease") return <FlaskConical className="h-4 w-4 text-maize" />;
  return <Leaf className="h-4 w-4 text-leaf" />;
}

function RecordsClient() {
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [pending, setPending] = useState<PendingRecord[]>([]);
  const [filter, setFilter] = useState<CropKey | "all">("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/detections?deviceId=${encodeURIComponent(getDeviceId())}&limit=150`);
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows || []);
      }
    } catch {}
    setPending(await getPending());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 9000);
    return () => clearInterval(iv);
  }, [load]);

  const filtered = useMemo(
    () => rows.filter((r) => filter === "all" || r.crop === filter),
    [rows, filter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of filtered) {
      const d = new Date(r.createdAt);
      const key = d.toLocaleDateString(lang === "sw" ? "sw-KE" : "en-KE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const arr = map.get(key) || [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered, lang]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader active="records" />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{t("records.title")}</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">{t("records.sub")}</p>
          </div>
          <Link
            href="/scan"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-leaf-deep px-5 font-heading text-sm font-bold text-white shadow-lg shadow-leaf-deep/25 transition-transform hover:scale-[1.03]"
          >
            <ScanLine className="h-5 w-5" />
            {t("hero.cta.scan")}
          </Link>
        </div>

        {/* filter chips */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 slim-scroll">
          <button
            onClick={() => setFilter("all")}
            className={`shrink-0 rounded-full px-4 py-2 font-heading text-xs font-bold transition-colors ${
              filter === "all" ? "bg-leaf-deep text-white" : "border border-ink/15 bg-white text-ink-soft"
            }`}
          >
            {t("records.filter.all")}
          </button>
          {CROPS.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-heading text-xs font-bold transition-colors ${
                filter === c ? "bg-leaf-deep text-white" : "border border-ink/15 bg-white text-ink-soft"
              }`}
            >
              <CropIcon crop={c} className="h-3.5 w-3.5" />
              {t(`crop.${c}` as never)}
            </button>
          ))}
        </div>

        {/* pending sync */}
        {pending.length > 0 && (
          <div className="mt-5 rounded-2xl border border-amber-alert/40 bg-amber-alert/10 p-4">
            <div className="flex items-center gap-2 font-heading text-sm font-bold text-amber-800">
              <Clock className="h-4 w-4" />
              {pending.length} {t("common.pending")}
            </div>
            <div className="mt-2 space-y-1.5">
              {pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-xs">
                  <span className="font-heading font-semibold text-ink">{String((p.payload as { nameEn?: string }).nameEn || "")}</span>
                  <span className="font-numeric text-[10px] text-ink-soft">
                    {new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* content */}
        {loading && rows.length === 0 ? (
          <div className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-14 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-ink/5">
              <ClipboardList className="h-9 w-9 text-ink-soft/50" />
            </div>
            <h2 className="mt-5 font-heading text-xl font-bold">{t("records.empty")}</h2>
            <Link
              href="/scan"
              className="mt-5 inline-flex h-13 items-center gap-2 rounded-2xl bg-leaf-deep px-6 py-3.5 font-heading text-sm font-bold text-white shadow-lg shadow-leaf-deep/25"
            >
              <ScanLine className="h-5 w-5" />
              {t("records.emptyCta")}
            </Link>
          </motion.div>
        ) : (
          <div className="mt-6 space-y-7">
            {groups.map(([day, dayRows]) => (
              <section key={day}>
                <div className="sticky top-[64px] z-10 flex items-center gap-2 bg-paper/90 py-2 backdrop-blur">
                  <span className="font-numeric text-[11px] font-semibold uppercase tracking-wider text-ink-soft/70">{day}</span>
                  <span className="h-px flex-1 bg-ink/10" />
                  <span className="font-numeric text-[11px] text-ink-soft/60">{dayRows.length}</span>
                </div>
                <div className="mt-2 space-y-2.5">
                  {dayRows.map((r, i) => {
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                        className="group flex items-center gap-3.5 rounded-2xl border border-ink/8 bg-white p-3 shadow-sm transition-all hover:border-leaf/40 hover:shadow-md"
                      >
                        {r.imageData ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.imageData} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-leaf-deep/8 text-leaf-deep">
                            <CropIcon crop={r.crop as CropKey} className="h-8 w-8" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <TypeGlyph type={r.detectionType} />
                            <span className="truncate font-heading text-[14.5px] font-bold">
                              {lang === "sw" ? r.nameSw : r.nameEn}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-soft">
                            <span className="capitalize">{t(`crop.${r.crop}` as never)}</span>
                            <span>· {r.county}</span>
                            <span className="font-numeric">
                              · {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`font-numeric text-sm font-bold ${
                              r.confidence >= 85 ? "text-leaf" : r.confidence >= 70 ? "text-amber-600" : "text-clay"
                            }`}
                          >
                            {r.confidence}%
                          </span>
                          {r.source === "offline-sync" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-haze/20 px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wide text-ink-soft">
                              <CloudUpload className="h-2.5 w-2.5" />
                              {t("common.synced")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-leaf/12 px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wide text-leaf-deep">
                              <Leaf className="h-2.5 w-2.5" />
                              online
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft/40 transition-transform group-hover:translate-x-0.5" />
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function RecordsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <RecordsClient />
    </Suspense>
  );
}
