"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { KenyaMap, type CountyStat } from "@/components/kenya-map";
import { CropIcon } from "@/components/crop-icon";
import { StatNumber, TrendChart, ThreatBars, CropDonut, type Bucket, type ThreatRow } from "@/components/dashboard-charts";
import { CROPS, type CropKey } from "@/lib/knowledge";
import {
  Activity,
  Bell,
  BellPlus,
  Bug,
  FlaskConical,
  MapPin,
  Radio,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  WifiOff,
  X,
  ScanLine,
  Filter,
} from "lucide-react";

/* ------------------------------ types ------------------------------ */
interface Stats {
  totals: { total: number; thisWeek: number; weekDelta: number; diseases: number; pests: number; healthy: number; offline: number };
  buckets: Bucket[];
  byCrop: { crop: string; count: number }[];
  topThreats: ThreatRow[];
  countyStats: CountyStat[];
  hotspot: { county: string; count: number; avgSeverity: number } | null;
  topThreat: { nameEn: string; nameSw: string; count: number; type: string } | null;
  recent: {
    id: string;
    crop: string;
    detectionType: string;
    nameEn: string;
    nameSw: string;
    confidence: number;
    severity: number;
    county: string;
    source: string;
    createdAt: string;
  }[];
}

interface AlertRow {
  id: string;
  titleEn: string;
  titleSw: string;
  messageEn: string;
  messageSw: string;
  county: string;
  crop: string;
  severity: "advisory" | "watch" | "critical";
  createdBy: string;
  createdAt: string;
}

function timeAgo(iso: string, lang: "en" | "sw"): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 90) return lang === "sw" ? "sasa hivi" : "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return lang === "sw" ? `dakika ${m} zilizopita` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "sw" ? `saa ${h} zilizopita` : `${h}h ago`;
  const dd = Math.floor(h / 24);
  return lang === "sw" ? `siku ${dd} zilizopita` : `${dd}d ago`;
}

const sevBadge: Record<string, string> = {
  advisory: "bg-sky-haze/15 text-sky-haze border-sky-haze/30",
  watch: "bg-amber-alert/10 text-amber-alert border-amber-alert/30",
  critical: "bg-red-alert/10 text-red-alert border-red-alert/30",
};

/* ------------------------------ templates ------------------------------ */
const TEMPLATES = [
  {
    key: "faw",
    titleEn: "Fall Armyworm outbreak warning",
    titleSw: "Tahadhari ya milipuko wa vifunjavifunja",
    messageEn:
      "Scout your maize twice a week. Check the whorl for caterpillars and frass. Apply Bt or neem extract early; use emamectin benzoate if more than a quarter of plants are affected.",
    messageSw:
      "Chunguza mahindi yako mara mbili kwa wiki. Angalia moyo wa mmea kwa viwavijeshi na kinyesi. Tumia Bt au mwarobaini mapema; tumia emamectin benzoate zaidi ya robo ya mimea ikiwa imeathirika.",
    crop: "maize",
    severity: "critical" as const,
  },
  {
    key: "blight",
    titleEn: "Late blight weather alert",
    titleSw: "Tahadhari ya hali ya uoza wa kuchelewa",
    messageEn:
      "Cool, wet weather this week favours late blight. Apply protective copper or mancozeb now, space plants well, and remove any leaf with water-soaked patches immediately.",
    messageSw:
      "Hali ya baridi na mvua ya wiki hii hupendelea uoza wa kuchelewa. Tumia dawa za kinga za shaba au mancozeb sasa, acha nafasi kati ya mimea, na uondoe jani lolote lenye mabaka ya maji mara moja.",
    crop: "potato",
    severity: "watch" as const,
  },
  {
    key: "clean-seed",
    titleEn: "Use certified clean planting material",
    titleSw: "Tumia mbegu safi zilizoidhinishwa",
    messageEn:
      "Virus diseases (mosaic, brown streak, TYLCV) move with infected seed and cuttings. Buy certified material, rogue out infected plants early, and report suspect cases to your ward officer.",
    messageSw:
      "Magonjwa ya virusi (mosaic, mistari ya kahawia, TYLCV) huenea kwa mbegu na vipande vilivyoambukizwa. Nunua mbegu zilizoidhinishwa, ng'oa mimea iliyoambukizwa mapema, na uripoti kesi zinazoshukiwa kwa afisa wa kata yako.",
    crop: "All Crops",
    severity: "advisory" as const,
  },
];

/* ------------------------------ page ------------------------------ */
export default function DashboardPage() {
  const { t, lang } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [crop, setCrop] = useState<"all" | CropKey>("all");
  const [type, setType] = useState<"all" | "disease" | "pest">("all");
  const [days, setDays] = useState(90);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats?days=${days}&crop=${crop}&type=${type}`);
      if (res.ok) setStats(await res.json());
    } catch {} finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [days, crop, type]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts?limit=15");
      if (res.ok) {
        const d = await res.json();
        setAlerts(d.rows || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadStats();
    const iv = setInterval(loadStats, 30000);
    return () => clearInterval(iv);
  }, [loadStats]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (!toast) return;
    const to = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(to);
  }, [toast]);

  const alertedCounties = useMemo(
    () => alerts.filter((a) => a.county !== "All Counties").map((a) => a.county),
    [alerts],
  );

  const recentFeed = useMemo(() => {
    if (!stats) return [];
    return stats.recent.filter((r) => !selectedCounty || r.county === selectedCounty);
  }, [stats, selectedCounty]);

  return (
    <div className="min-h-screen bg-night text-paper-soft texture-grain">
      <SiteHeader dark active="dashboard" />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8">
        {/* ---- title band ---- */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-mint" />
              </span>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-paper sm:text-4xl">{t("dash.title")}</h1>
            </div>
            <p className="mt-1.5 max-w-xl text-sm text-mint-dim">{t("dash.sub")}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {lastRefresh && (
              <span className="hidden items-center gap-1.5 font-numeric text-[11px] text-mint-dim/70 sm:flex">
                <RefreshCw className="h-3 w-3" />
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => setModal(true)}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-maize px-5 font-heading text-sm font-bold text-night shadow-xl shadow-maize/20 transition-transform hover:scale-[1.03] active:scale-95"
            >
              <BellPlus className="h-5 w-5" />
              {t("dash.alerts.compose")}
            </button>
          </div>
        </div>

        {/* ---- filter bar ---- */}
        <div className="mt-7 flex flex-wrap items-center gap-2.5 rounded-2xl border border-night-line bg-night-card/70 p-3">
          <span className="flex items-center gap-1.5 px-1 font-heading text-[11px] font-bold uppercase tracking-wider text-mint-dim">
            <Filter className="h-3.5 w-3.5" />
          </span>

          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value as "all" | CropKey)}
            className="rounded-xl border border-night-line bg-night-soft px-3 py-2 font-heading text-xs font-semibold text-paper-soft outline-none focus:border-mint/50"
            aria-label={t("dash.filter.crop")}
          >
            <option value="all">{t("dash.filter.allCrops")}</option>
            {CROPS.map((c) => (
              <option key={c} value={c}>
                {t(`crop.${c}` as never)}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as "all" | "disease" | "pest")}
            className="rounded-xl border border-night-line bg-night-soft px-3 py-2 font-heading text-xs font-semibold text-paper-soft outline-none focus:border-mint/50"
            aria-label={t("dash.filter.type")}
          >
            <option value="all">{t("dash.filter.allTypes")}</option>
            <option value="disease">{t("result.type.disease")}</option>
            <option value="pest">{t("result.type.pest")}</option>
          </select>

          <div className="flex rounded-xl border border-night-line bg-night-soft p-1">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-3 py-1.5 font-numeric text-[11px] font-semibold transition-colors ${
                  days === d ? "bg-mint/15 text-mint" : "text-mint-dim hover:text-mint"
                }`}
              >
                {t(`dash.days.${d}` as never)}
              </button>
            ))}
          </div>

          {selectedCounty && (
            <button
              onClick={() => setSelectedCounty(null)}
              className="inline-flex items-center gap-1.5 rounded-full border border-maize/40 bg-maize/10 px-3 py-1.5 font-heading text-[11px] font-bold text-maize"
            >
              <MapPin className="h-3 w-3" />
              {selectedCounty}
              <X className="h-3 w-3" />
            </button>
          )}

          <span className="ml-auto hidden font-numeric text-[10px] text-mint-dim/60 lg:block">
            {stats ? `${stats.totals.total.toLocaleString()} records · ${days}d window` : "…"}
          </span>
        </div>

        {/* ---- stat cards ---- */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Activity className="h-4.5 w-4.5 h-5 w-5" />}
            label={t("dash.stat.week")}
            value={stats ? <StatNumber value={stats.totals.thisWeek} className="text-[26px] font-semibold text-paper" /> : <Skel />}
            sub={
              stats && (
                <span
                  className={`inline-flex items-center gap-1 font-numeric text-[11px] font-semibold ${
                    stats.totals.weekDelta >= 0 ? "text-red-alert" : "text-mint"
                  }`}
                >
                  {stats.totals.weekDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stats.totals.weekDelta >= 0 ? "+" : ""}
                  {stats.totals.weekDelta}% {t("dash.stat.trend")}
                </span>
              )
            }
          />
          <StatCard
            icon={<Bell className="h-5 w-5" />}
            label={t("dash.stat.activeAlerts")}
            value={<StatNumber value={alerts.length} className="text-[26px] font-semibold text-paper" />}
            sub={
              <span className="font-numeric text-[11px] text-mint-dim">
                {alerts.filter((a) => a.severity === "critical").length} critical
              </span>
            }
          />
          <StatCard
            icon={<MapPin className="h-5 w-5" />}
            label={t("dash.stat.hotspot")}
            value={
              stats?.hotspot ? (
                <span className="font-heading text-[19px] font-bold leading-tight text-paper">{stats.hotspot.county}</span>
              ) : (
                <Skel />
              )
            }
            sub={
              stats?.hotspot && (
                <span className="font-numeric text-[11px] text-mint-dim">
                  {stats.hotspot.count} det · sev {stats.hotspot.avgSeverity.toFixed(1)}
                </span>
              )
            }
          />
          <StatCard
            icon={stats?.topThreat?.type === "pest" ? <Bug className="h-5 w-5" /> : <FlaskConical className="h-5 w-5" />}
            label={t("dash.stat.topThreat")}
            value={
              stats?.topThreat ? (
                <span className="font-heading text-[19px] font-bold leading-tight text-paper">
                  {lang === "sw" ? stats.topThreat.nameSw : stats.topThreat.nameEn}
                </span>
              ) : (
                <Skel />
              )
            }
            sub={stats?.topThreat && <span className="font-numeric text-[11px] text-mint-dim">{stats.topThreat.count} detections</span>}
          />
        </div>

        {/* ---- main grid ---- */}
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {/* map */}
          <section className="overflow-hidden rounded-3xl border border-night-line bg-night-card/70 lg:col-span-2">
            <PanelHead title={t("dash.map.title")} sub={t("dash.map.sub")} />
            <div className="px-2 pb-2">
              {stats ? (
                <KenyaMap
                  stats={stats.countyStats}
                  alertedCounties={alertedCounties}
                  selected={selectedCounty}
                  onSelect={(c) => setSelectedCounty(c)}
                />
              ) : (
                <div className="h-[420px] animate-pulse rounded-2xl bg-night-line/20" />
              )}
            </div>
          </section>

          {/* county watchlist */}
          <section className="flex flex-col overflow-hidden rounded-3xl border border-night-line bg-night-card/70">
            <PanelHead title={t("dash.counties.title")} sub={t("dash.counties.sub")} />
            <div className="slim-scroll max-h-[420px] flex-1 space-y-1 overflow-y-auto p-3">
              {stats
                ? stats.countyStats.slice(0, 12).map((c, i) => (
                    <button
                      key={c.county}
                      onClick={() => setSelectedCounty(selectedCounty === c.county ? null : c.county)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selectedCounty === c.county ? "bg-mint/10 ring-1 ring-mint/30" : "hover:bg-night-soft"
                      }`}
                    >
                      <span className="font-numeric text-[10px] text-mint-dim/60 w-5">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-heading text-[13px] font-semibold text-paper-soft">{c.county}</span>
                          {alertedCounties.includes(c.county) && <span className="h-1.5 w-1.5 animate-blink rounded-full bg-amber-alert" />}
                        </div>
                        {c.topThreat && <div className="truncate text-[10.5px] text-mint-dim/80">{c.topThreat}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-numeric text-sm font-semibold text-mint">{c.count}</div>
                        <div className="font-numeric text-[9.5px] text-mint-dim/70">+{c.recent} wk</div>
                      </div>
                    </button>
                  ))
                : Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-night-line/20" />)}
            </div>
            <div className="border-t border-night-line p-4">
              {stats ? <CropDonut byCrop={stats.byCrop} /> : <div className="h-[118px] animate-pulse rounded-xl bg-night-line/20" />}
            </div>
          </section>

          {/* trend */}
          <section className="overflow-hidden rounded-3xl border border-night-line bg-night-card/70 lg:col-span-2">
            <PanelHead title={t("dash.trend.title")} sub={t("dash.trend.sub")} />
            <div className="p-4">
              {stats ? <TrendChart buckets={stats.buckets} /> : <div className="h-[230px] animate-pulse rounded-xl bg-night-line/20" />}
            </div>
          </section>

          {/* threats */}
          <section className="overflow-hidden rounded-3xl border border-night-line bg-night-card/70">
            <PanelHead title={t("dash.threats.title")} sub={t("dash.threats.sub")} />
            <div className="slim-scroll max-h-[280px] overflow-y-auto p-5">
              {stats ? <ThreatBars threats={stats.topThreats} lang={lang} /> : <div className="h-[240px] animate-pulse rounded-xl bg-night-line/20" />}
            </div>
          </section>
        </div>

        {/* ---- alerts + live feed ---- */}
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <section className="overflow-hidden rounded-3xl border border-night-line bg-night-card/70">
            <div className="flex items-center justify-between border-b border-night-line px-5 py-4">
              <h2 className="font-heading text-[15px] font-bold text-paper">{t("dash.alerts.title")}</h2>
              <button
                onClick={() => setModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-maize/40 bg-maize/10 px-3 py-1.5 font-heading text-[11px] font-bold text-maize transition-colors hover:bg-maize/20"
              >
                <BellPlus className="h-3.5 w-3.5" />
                {t("dash.alerts.compose")}
              </button>
            </div>
            <div className="slim-scroll max-h-[430px] space-y-3 overflow-y-auto p-4">
              {alerts.length === 0 && (
                <div className="rounded-xl border border-dashed border-night-line p-6 text-center text-xs text-mint-dim">{t("dash.alerts.empty")}</div>
              )}
              {alerts.map((a) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-night-line bg-night-soft/70 p-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-heading font-bold uppercase tracking-wider ${sevBadge[a.severity]}`}>
                      {t(`sev.${a.severity}` as never)}
                    </span>
                    <span className="font-numeric text-[10px] text-mint-dim/70">{timeAgo(a.createdAt, lang)}</span>
                  </div>
                  <h3 className="mt-2 font-heading text-[13.5px] font-bold leading-snug text-paper">
                    {lang === "sw" ? a.titleSw : a.titleEn}
                  </h3>
                  <p className="mt-1 line-clamp-3 text-[11.5px] leading-relaxed text-paper-soft/65">
                    {lang === "sw" ? a.messageSw : a.messageEn}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] font-heading text-mint-dim">
                    <span className="inline-flex items-center gap-1 rounded-full bg-night-line/40 px-2 py-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {a.county}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-night-line/40 px-2 py-0.5 capitalize">{a.crop}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* live feed */}
          <section className="overflow-hidden rounded-3xl border border-night-line bg-night-card/70 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-night-line px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 font-heading text-[15px] font-bold text-paper">
                  <Radio className="h-4 w-4 text-mint" />
                  {t("dash.live.title")}
                </h2>
                <p className="mt-0.5 text-[11px] text-mint-dim">{t("dash.live.sub")}</p>
              </div>
              {stats && (
                <span className="hidden items-center gap-1.5 rounded-full border border-night-line px-3 py-1 font-numeric text-[10px] text-mint-dim sm:inline-flex">
                  <WifiOff className="h-3 w-3" />
                  {stats.totals.offline} offline-sync
                </span>
              )}
            </div>
            <div className="slim-scroll max-h-[430px] overflow-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="sticky top-0 bg-night-card">
                  <tr className="border-b border-night-line text-[10px] font-heading font-bold uppercase tracking-wider text-mint-dim/70">
                    <th className="px-5 py-3">{t("dash.table.id")}</th>
                    <th className="px-3 py-3">{t("dash.table.crop")}</th>
                    <th className="px-3 py-3">{t("dash.table.result")}</th>
                    <th className="px-3 py-3">{t("dash.table.county")}</th>
                    <th className="px-3 py-3 text-right">{t("dash.table.conf")}</th>
                    <th className="px-3 py-3">{t("dash.table.source")}</th>
                    <th className="px-5 py-3 text-right">{t("dash.table.time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFeed.map((r) => (
                    <tr key={r.id} className="border-b border-night-line/50 transition-colors hover:bg-night-soft/60">
                      <td className="px-5 py-3 font-numeric text-[11px] text-mint-dim">#{r.id.slice(0, 6)}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-night-line/30 px-2 py-1 text-mint">
                          <CropIcon crop={r.crop as CropKey} className="h-4 w-4" />
                        </span>
                      </td>
                      <td className="max-w-[220px] px-3 py-3">
                        <div className="truncate font-heading text-[12.5px] font-semibold text-paper-soft">
                          {lang === "sw" ? r.nameSw : r.nameEn}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-mint-dim/70">{r.detectionType}</div>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-paper-soft/80">{r.county}</td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`font-numeric text-[12px] font-semibold ${
                            r.confidence >= 85 ? "text-mint" : r.confidence >= 70 ? "text-maize" : "text-red-alert"
                          }`}
                        >
                          {r.confidence}%
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {r.source === "offline-sync" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-haze/10 px-2 py-0.5 text-[9.5px] font-heading font-bold text-sky-haze">
                            <WifiOff className="h-2.5 w-2.5" />
                            offline
                          </span>
                        ) : (
                          <span className="rounded-full bg-mint/10 px-2 py-0.5 text-[9.5px] font-heading font-bold text-mint-dim">online</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-numeric text-[10.5px] text-mint-dim/80">{timeAgo(r.createdAt, lang)}</td>
                    </tr>
                  ))}
                  {recentFeed.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-xs text-mint-dim">
                        —
                      </td>
                    </tr>
                  )}
                  {loading &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-night-line/50">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="h-4 animate-pulse rounded bg-night-line/30" />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* ---------------- compose alert modal ---------------- */}
      <AnimatePresence>
        {modal && (
          <AlertComposer
            onClose={() => setModal(false)}
            onSent={() => {
              setModal(false);
              setToast(t("dash.alertSent"));
              loadAlerts();
            }}
          />
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-mint/30 bg-night-card px-5 py-3.5 shadow-2xl"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint/15 text-mint">
              <Bell className="h-4 w-4" />
            </span>
            <span className="font-heading text-sm font-semibold text-paper">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ subcomponents ------------------------------ */

function Skel() {
  return <span className="block h-7 w-20 animate-pulse rounded-lg bg-night-line/40" />;
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-night-line bg-night-card/70 p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-heading font-semibold uppercase tracking-[0.14em] text-mint-dim">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/10 text-mint">{icon}</span>
      </div>
      <div className="mt-3">{value}</div>
      {sub && <div className="mt-1.5">{sub}</div>}
    </motion.div>
  );
}

function PanelHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="border-b border-night-line px-5 py-4">
      <h2 className="font-heading text-[15px] font-bold text-paper">{title}</h2>
      <p className="mt-0.5 text-[11px] text-mint-dim">{sub}</p>
    </div>
  );
}

function AlertComposer({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const { t } = useI18n();
  const [titleEn, setTitleEn] = useState("");
  const [titleSw, setTitleSw] = useState("");
  const [messageEn, setMessageEn] = useState("");
  const [messageSw, setMessageSw] = useState("");
  const [county, setCounty] = useState("All Counties");
  const [crop, setCrop] = useState("All Crops");
  const [severity, setSeverity] = useState<"advisory" | "watch" | "critical">("watch");
  const [sending, setSending] = useState(false);

  const applyTemplate = (tpl: (typeof TEMPLATES)[number]) => {
    setTitleEn(tpl.titleEn);
    setTitleSw(tpl.titleSw);
    setMessageEn(tpl.messageEn);
    setMessageSw(tpl.messageSw);
    setCrop(tpl.crop);
    setSeverity(tpl.severity);
  };

  const submit = async () => {
    if (!titleEn.trim() || !messageEn.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleEn, titleSw, messageEn, messageSw, county, crop, severity }),
      });
      if (res.ok) onSent();
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-night/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="slim-scroll max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-night-line bg-night-card p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-paper">{t("dash.AlertForm.title")}</h2>
          <button onClick={onClose} className="rounded-full bg-night-soft p-2 text-mint-dim transition-colors hover:text-mint">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* templates */}
        <div className="mt-4 flex flex-wrap gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              onClick={() => applyTemplate(tpl)}
              className="rounded-full border border-night-line bg-night-soft px-3 py-1.5 font-heading text-[11px] font-semibold text-mint-dim transition-colors hover:border-mint/40 hover:text-mint"
            >
              {tpl.titleEn}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-heading font-bold uppercase tracking-wider text-mint-dim">
              {t("dash.alertForm.county")}
            </span>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full rounded-xl border border-night-line bg-night-soft px-3 py-2.5 text-sm font-heading font-semibold text-paper-soft outline-none focus:border-mint/50"
            >
              <option>All Counties</option>
              {Array.from(
                new Set(
                  [
                    "Trans Nzoia",
                    "Uasin Gishu",
                    "Nakuru",
                    "Nyandarua",
                    "Meru",
                    "Kirinyaga",
                    "Kajiado",
                    "Machakos",
                    "Kilifi",
                    "Kwale",
                    "Busia",
                    "Siaya",
                    "Kisii",
                    "Embu",
                    "Kakamega",
                    "Bungoma",
                    "Homa Bay",
                    "Nairobi",
                    "Mombasa",
                  ],
                ),
              ).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-heading font-bold uppercase tracking-wider text-mint-dim">
              {t("dash.alertForm.crop")}
            </span>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full rounded-xl border border-night-line bg-night-soft px-3 py-2.5 text-sm font-heading font-semibold text-paper-soft outline-none focus:border-mint/50"
            >
              <option>All Crops</option>
              {CROPS.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3">
          <span className="mb-1 block text-[10px] font-heading font-bold uppercase tracking-wider text-mint-dim">
            {t("dash.alertForm.severity")}
          </span>
          <div className="flex gap-2">
            {(["advisory", "watch", "critical"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`flex-1 rounded-xl border px-3 py-2.5 font-heading text-xs font-bold uppercase tracking-wide transition-colors ${sevBadge[s]} ${
                  severity === s ? "ring-2 ring-offset-0" : "opacity-45 hover:opacity-80"
                }`}
              >
                {t(`sev.${s}` as never)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Alert title (English)"
            className="w-full rounded-xl border border-night-line bg-night-soft px-4 py-2.5 text-sm font-heading font-semibold text-paper placeholder:text-mint-dim/50 outline-none focus:border-mint/50"
          />
          <input
            value={titleSw}
            onChange={(e) => setTitleSw(e.target.value)}
            placeholder="Kichwa cha tahadhari (Kiswahili)"
            className="w-full rounded-xl border border-night-line bg-night-soft px-4 py-2.5 text-sm font-heading font-semibold text-paper placeholder:text-mint-dim/50 outline-none focus:border-mint/50"
          />
          <textarea
            value={messageEn}
            onChange={(e) => setMessageEn(e.target.value)}
            placeholder={t("dash.alertForm.subEn")}
            rows={3}
            className="w-full resize-none rounded-xl border border-night-line bg-night-soft px-4 py-2.5 text-sm font-body text-paper placeholder:text-mint-dim/50 outline-none focus:border-mint/50"
          />
          <textarea
            value={messageSw}
            onChange={(e) => setMessageSw(e.target.value)}
            placeholder={t("dash.alertForm.subSw")}
            rows={3}
            className="w-full resize-none rounded-xl border border-night-line bg-night-soft px-4 py-2.5 text-sm font-body text-paper placeholder:text-mint-dim/50 outline-none focus:border-mint/50"
          />
        </div>

        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-mint-dim/80">
          <ScanLine className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("dash.alertForm.hint")}
        </p>

        <button
          onClick={submit}
          disabled={sending || !titleEn.trim() || !messageEn.trim()}
          className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-maize py-3.5 font-heading text-[15px] font-bold text-night shadow-xl shadow-maize/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40"
        >
          {sending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <BellPlus className="h-5 w-5" />}
          {sending ? t("dash.alertForm.sending") : t("dash.alertForm.send")}
        </button>
      </motion.div>
    </motion.div>
  );
}
