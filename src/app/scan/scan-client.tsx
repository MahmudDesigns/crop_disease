"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { CROPS, SAMPLES, diagnoseFromHash, type CropKey, type Diagnosis } from "@/lib/knowledge";
import { COUNTIES, countyByName } from "@/lib/kenya";
import {
  getDeviceId,
  getProfileCounty,
  setProfileCounty,
  queueDetection,
  sha256Hex,
  useOnlineStatus,
} from "@/lib/offline";
import { CropIcon } from "@/components/crop-icon";
import { ConfidenceRing } from "@/components/confidence-ring";
import { SiteHeader } from "@/components/site-header";
import {
  Camera,
  Upload,
  ScanLine,
  RotateCcw,
  CheckCircle2,
  CloudUpload,
  Smartphone,
  Leaf,
  Bug,
  FlaskConical,
  Sprout,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Megaphone,
  ClipboardList,
  ImageIcon,
  X,
} from "lucide-react";

type Step = "crop" | "photo" | "analyze" | "result";

interface DiagnoseResult {
  diagnosis: Diagnosis;
  recordId: string | null;
  source: "cloud" | "local";
  imageData: string | null;
}

/* downscale any captured photo so records stay light */
async function downscaleImage(file: File | Blob): Promise<{ blob: Blob; dataUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.72));
  const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
  return { blob, dataUrl };
}

const ANALYZE_MS = 2900;

export default function ScanClient() {
  const { t, lang } = useI18n();
  const params = useSearchParams();
  const online = useOnlineStatus();

  const [step, setStep] = useState<Step>("crop");
  const [crop, setCrop] = useState<CropKey | null>(null);
  const [county, setCounty] = useState("Nakuru");
  const [photo, setPhoto] = useState<{ preview: string; blob: Blob; dataUrl: string } | null>(null);
  const [forceKey, setForceKey] = useState<string | undefined>(undefined);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [treatTab, setTreatTab] = useState<"organic" | "chemical">("organic");
  const [showAlt, setShowAlt] = useState(false);
  const [alerts, setAlerts] = useState<{ titleEn: string; titleSw: string; messageEn: string; messageSw: string; severity: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const analyzeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCounty(getProfileCounty());
  }, []);

  // officer alerts for farmer's county
  useEffect(() => {
    fetch(`/api/alerts?county=${encodeURIComponent(county)}&limit=3`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.rows && setAlerts(d.rows))
      .catch(() => {});
  }, [county]);

  const reset = useCallback((keepCrop = true) => {
    setPhoto(null);
    setResult(null);
    setLogLines([]);
    setProgress(0);
    setForceKey(undefined);
    if (!keepCrop) setCrop(null);
    setStep(keepCrop ? "photo" : "crop");
  }, []);

  /* ---- sample pre-load from landing page ---- */
  const loadSample = useCallback(
    async (idx: number) => {
      const s = SAMPLES[idx];
      if (!s) return;
      setCrop(s.crop);
      try {
        const res = await fetch(s.src);
        const raw = await res.blob();
        const { blob, dataUrl } = await downscaleImage(raw);
        setPhoto({ preview: dataUrl, blob, dataUrl });
        setForceKey(s.forceKey);
        setStep("photo");
      } catch {}
    },
    [],
  );

  useEffect(() => {
    const sample = params.get("sample");
    if (sample != null) {
      const idx = Number(sample);
      if (!Number.isNaN(idx)) loadSample(idx);
    }
  }, [params, loadSample]);

  /* ---- photo intake ---- */
  const onFile = useCallback(async (file: File | Blob) => {
    const { blob, dataUrl } = await downscaleImage(file);
    setPhoto({ preview: dataUrl, blob, dataUrl });
    setForceKey(undefined);
  }, []);

  /* ---- diagnosis ---- */
  const runAnalysis = useCallback(async () => {
    if (!photo || !crop) return;
    setStep("analyze");
    setLogLines([]);
    setProgress(0);

    const wantsLocal = !online;
    const lines = [
      wantsLocal ? t("scan.analyzing.local") : t("scan.analyzing.cloud"),
      t("scan.analyzing.pre"),
      t("scan.analyzing.features"),
      t("scan.analyzing.match"),
      t("scan.analyzing.confidence"),
    ];
    lines.forEach((line, i) => {
      setTimeout(() => setLogLines((prev) => [...prev, line]), 240 + i * 480);
      setTimeout(() => setProgress(((i + 1) / lines.length) * 100), 240 + i * 480 + 220);
    });

    const finish = (r: DiagnoseResult) => {
      analyzeRef.current = setTimeout(() => {
        setResult(r);
        setStep("result");
      }, ANALYZE_MS);
    };

    const buffer = await photo.blob.arrayBuffer();

    if (!wantsLocal) {
      try {
        const form = new FormData();
        form.append("image", new File([buffer], "scan.jpg", { type: "image/jpeg" }));
        form.append("crop", crop);
        form.append("deviceId", getDeviceId());
        form.append("county", county);
        if (forceKey) form.append("sampleKey", forceKey);
        const res = await fetch("/api/detect", { method: "POST", body: form });
        if (res.ok) {
          const data = await res.json();
          finish({ diagnosis: data.diagnosis, recordId: data.recordId, source: "cloud", imageData: photo.dataUrl });
          return;
        }
      } catch {
        // fall through to on-device inference
      }
    }

    // on-device path — "TFLite" demo: identical deterministic engine
    const hash = await sha256Hex(buffer);
    const diagnosis = diagnoseFromHash(hash, crop, forceKey);
    const payload = {
      deviceId: getDeviceId(),
      crop,
      county,
      detectionType: diagnosis.type,
      resultKey: diagnosis.key,
      nameEn: diagnosis.nameEn,
      nameSw: diagnosis.nameSw,
      latinName: diagnosis.latinName ?? null,
      confidence: diagnosis.confidence,
      severity: diagnosis.severity,
      spreadRisk: diagnosis.spreadRisk,
      createdAt: new Date().toISOString(),
    };
    await queueDetection(payload, photo.dataUrl.length < 380_000 ? photo.dataUrl : null);
    finish({ diagnosis, recordId: null, source: "local", imageData: photo.dataUrl });
  }, [photo, crop, online, county, forceKey, t]);

  useEffect(() => () => {
    if (analyzeRef.current) clearTimeout(analyzeRef.current);
  }, []);

  const d = result?.diagnosis;
  const stepIndex = step === "crop" ? 0 : step === "photo" ? 1 : step === "analyze" ? 1 : 2;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader active="scan" />

      {/* step progress */}
      <div className="border-b border-ink/8 bg-paper-soft/60">
        <div className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-3">
          {[t("scan.step.crop"), t("scan.step.photo"), t("scan.step.result")].map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-numeric text-[11px] font-semibold transition-colors ${
                  i < stepIndex
                    ? "bg-leaf text-white"
                    : i === stepIndex
                      ? "bg-leaf-deep text-white"
                      : "bg-ink/8 text-ink-soft/60"
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-[11.5px] font-heading font-semibold sm:text-xs ${i === stepIndex ? "text-ink" : "text-ink-soft/60"}`}>
                {label}
              </span>
              {i < 2 && <span className={`mx-1 h-px flex-1 ${i < stepIndex ? "bg-leaf" : "bg-ink/10"}`} />}
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        {/* regional alert strip */}
        {alerts.length > 0 && step === "crop" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 overflow-hidden rounded-2xl border border-clay/25 bg-clay/10">
            <div className="flex items-center gap-2 border-b border-clay/15 px-4 py-2">
              <Megaphone className="h-4 w-4 text-clay-deep" />
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-clay-deep">
                {t("dash.alertsOnPhone.title")}
              </span>
            </div>
            <div className="px-4 py-3">
              <div className="font-heading text-sm font-bold text-ink">
                {lang === "sw" ? alerts[0].titleSw : alerts[0].titleEn}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                {lang === "sw" ? alerts[0].messageSw : alerts[0].messageEn}
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ================= STEP 1: CROP ================= */}
          {step === "crop" && (
            <motion.div key="crop" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}>
              <h1 className="font-heading text-[26px] font-bold leading-tight tracking-tight">{t("scan.pickCrop.title")}</h1>
              <p className="mt-1.5 text-sm text-ink-soft">{t("scan.pickCrop.sub")}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CROPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCrop(c);
                      setStep("photo");
                    }}
                    className="group flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-ink/10 bg-white/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-leaf hover:shadow-md active:scale-[0.97]"
                  >
                    <span className="text-leaf transition-transform group-hover:scale-110">
                      <CropIcon crop={c} className="h-9 w-9" />
                    </span>
                    <span className="font-heading text-[15px] font-bold">{t(`crop.${c}` as never)}</span>
                  </button>
                ))}

                <div className="flex min-h-[108px] flex-col justify-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-white/40 p-4">
                  <label className="text-[10px] font-heading font-bold uppercase tracking-wider text-ink-soft/70">
                    {t("dash.alertForm.county")}
                  </label>
                  <select
                    value={county}
                    onChange={(e) => {
                      setCounty(e.target.value);
                      setProfileCounty(e.target.value);
                    }}
                    className="w-full rounded-lg border border-ink/15 bg-white px-2 py-2 text-sm font-heading font-semibold text-ink outline-none focus:border-leaf"
                  >
                    {COUNTIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* photo tips */}
              <div className="mt-6 rounded-2xl border border-sky-haze/40 bg-sky-haze/15 p-4">
                <div className="flex items-center gap-2 font-heading text-sm font-bold text-ink">
                  <Camera className="h-4 w-4 text-leaf" />
                  {t("scan.tip.title")}
                </div>
                <ul className="mt-2 space-y-1.5">
                  {[t("scan.tip.1"), t("scan.tip.2"), t("scan.tip.3")].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-[13px] text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: PHOTO ================= */}
          {step === "photo" && crop && (
            <motion.div key="photo" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => reset(false)}
                  className="flex h-10 items-center gap-1.5 rounded-full border border-ink/15 bg-white px-4 font-heading text-sm font-semibold text-ink-soft transition-colors hover:border-ink/30"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("common.back")}
                </button>
                <span className="inline-flex items-center gap-2 rounded-full bg-leaf-deep/10 px-4 py-2 font-heading text-sm font-bold text-leaf-deep">
                  <CropIcon crop={crop} className="h-4 w-4" />
                  {t(`crop.${crop}` as never)}
                </span>
              </div>

              <h1 className="mt-5 font-heading text-[26px] font-bold leading-tight tracking-tight">{t("scan.photo.title")}</h1>
              <p className="mt-1.5 text-sm text-ink-soft">{t("scan.photo.sub")}</p>

              {!photo ? (
                <>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f && f.type.startsWith("image/")) onFile(f);
                    }}
                    className={`mt-6 rounded-3xl border-2 border-dashed p-6 text-center transition-colors ${
                      dragOver ? "border-leaf bg-leaf/10" : "border-ink/20 bg-white/60"
                    }`}
                  >
                    <div className="mx-auto grid max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => camRef.current?.click()}
                        className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-leaf-deep px-5 font-heading text-[15px] font-bold text-white shadow-lg shadow-leaf-deep/25 transition-transform hover:scale-[1.02] active:scale-95"
                      >
                        <Camera className="h-6 w-6" />
                        {t("scan.photo.capture")}
                      </button>
                      <button
                        onClick={() => galRef.current?.click()}
                        className="flex h-16 items-center justify-center gap-3 rounded-2xl border-2 border-ink/15 bg-white px-5 font-heading text-[15px] font-bold text-ink transition-colors hover:border-ink/40"
                      >
                        <Upload className="h-5 w-5" />
                        {t("scan.photo.upload")}
                      </button>
                    </div>
                    <p className="mt-4 hidden items-center justify-center gap-2 text-xs text-ink-soft/70 sm:flex">
                      <ImageIcon className="h-3.5 w-3.5" />
                      {t("scan.photo.dragdrop")}
                    </p>
                  </div>

                  <input
                    ref={camRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f);
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={galRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f);
                      e.target.value = "";
                    }}
                  />

                  {/* samples */}
                  <div className="mt-7">
                    <div className="mb-3 font-heading text-sm font-bold text-ink-soft">{t("scan.samples.title")}</div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {SAMPLES.map((s, i) => (
                        <button
                          key={s.src}
                          onClick={() => loadSample(i)}
                          title={lang === "sw" ? s.labelSw : s.labelEn}
                          className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.03] ${
                            s.crop === crop ? "border-leaf" : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                        >
                          <Image src={s.src} alt={s.labelEn} fill className="object-cover" />
                          {s.crop === crop && (
                            <span className="absolute right-1 top-1 rounded-full bg-leaf p-1 text-white">
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-6">
                  <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-night shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.preview} alt="crop scan" className="max-h-[420px] w-full object-cover" />
                    {forceKey && (
                      <span className="absolute left-3 top-3 rounded-full bg-maize px-3 py-1 font-heading text-[11px] font-bold text-night">
                        sample
                      </span>
                    )}
                    <button
                      onClick={() => reset(true)}
                      className="absolute right-3 top-3 rounded-full bg-night/70 p-2 text-white backdrop-blur transition-colors hover:bg-night"
                      aria-label="remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => reset(true)}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-ink/15 bg-white font-heading text-sm font-bold text-ink transition-colors hover:border-ink/40"
                    >
                      <RotateCcw className="h-5 w-5" />
                      {t("scan.photo.retake")}
                    </button>
                    <button
                      onClick={runAnalysis}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-leaf-deep font-heading text-sm font-bold text-white shadow-lg shadow-leaf-deep/30 transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      <ScanLine className="h-5 w-5" />
                      {t("scan.photo.use")}
                    </button>
                  </div>

                  {!online && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-alert/40 bg-amber-alert/10 p-3 text-xs leading-relaxed text-amber-800">
                      <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
                      {t("common.offlineNote")}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ================= ANALYZING ================= */}
          {step === "analyze" && photo && (
            <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-4">
              <h1 className="text-center font-heading text-2xl font-bold">{t("scan.analyzing.title")}</h1>

              <div className="relative mx-auto mt-8 max-w-sm overflow-hidden rounded-3xl border border-ink/10 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="analyzing" className="aspect-square w-full object-cover" />
                <div className="absolute inset-0 bg-leaf-deep/25" />
                {/* scan grid */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(143,230,168,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(143,230,168,0.5) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="animate-scanline absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-mint/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-night/80 px-3 py-2 backdrop-blur">
                  <div className="h-1.5 overflow-hidden rounded-full bg-night-line">
                    <div className="h-full rounded-full bg-mint transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-1.5 text-right font-numeric text-[11px] text-mint">{Math.round(progress)}%</div>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-sm space-y-1.5 rounded-2xl border border-ink/10 bg-white/70 p-4">
                {logLines.map((line, i) => (
                  <motion.div key={line} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 font-numeric text-[11.5px] text-ink-soft">
                    <span className={`h-1.5 w-1.5 rounded-full ${i === logLines.length - 1 ? "animate-blink bg-maize" : "bg-leaf"}`} />
                    {line}
                  </motion.div>
                ))}
                {logLines.length === 0 && <div className="font-numeric text-[11.5px] text-ink-soft/60">boot…</div>}
              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: RESULT ================= */}
          {step === "result" && d && (
            <motion.div key="result" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* status chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-leaf-deep/10 px-3.5 py-1.5 font-heading text-xs font-bold text-leaf-deep">
                  <CropIcon crop={d.crop} className="h-4 w-4" />
                  {t(`crop.${d.crop}` as never)}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-heading text-xs font-bold ${
                    d.type === "pest"
                      ? "bg-maize/20 text-clay-deep"
                      : d.type === "disease"
                        ? "bg-clay/15 text-clay-deep"
                        : "bg-leaf/15 text-leaf-deep"
                  }`}
                >
                  {d.type === "pest" ? <Bug className="h-3.5 w-3.5" /> : d.type === "disease" ? <FlaskConical className="h-3.5 w-3.5" /> : <Leaf className="h-3.5 w-3.5" />}
                  {t(`result.type.${d.type}` as never)}
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 font-numeric text-[10px] text-ink-soft">
                  {result.source === "cloud" ? (
                    <>
                      <CloudUpload className="h-3 w-3 text-leaf" /> {t("result.modelBadge.cloud")}
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-3 w-3 text-clay" /> {t("result.modelBadge.local")}
                    </>
                  )}
                </span>
              </div>

              {/* headline card */}
              <div className="mt-5 overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
                <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:gap-7">
                  <ConfidenceRing value={d.confidence} size={132} />
                  <div className="text-center sm:text-left">
                    <div className="text-[11px] font-heading font-bold uppercase tracking-[0.18em] text-ink-soft/60">
                      {t("result.diagnosis")}
                    </div>
                    <h1 className="mt-1 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">
                      {lang === "sw" ? d.nameSw : d.nameEn}
                    </h1>
                    {lang === "sw" ? (
                      <div className="mt-0.5 text-sm text-ink-soft/70">{d.nameEn}</div>
                    ) : d.latinName ? (
                      <div className="mt-0.5 font-body text-sm italic text-ink-soft/70">{d.latinName}</div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
                      {/* severity meter */}
                      <div>
                        <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-ink-soft/60">{t("result.severity")}</div>
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <span
                              key={n}
                              className={`h-2.5 w-5 rounded-full ${
                                n <= d.severity ? (d.severity >= 4 ? "bg-clay" : d.severity >= 2 ? "bg-maize" : "bg-leaf") : "bg-ink/10"
                              }`}
                            />
                          ))}
                          <span className="ml-1.5 font-numeric text-[11px] font-semibold text-ink">
                            {d.severity}/5 <span className="font-body font-normal text-ink-soft">{t(`sev.${d.severity}` as never)}</span>
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-heading font-bold uppercase tracking-widest text-ink-soft/60">{t("result.spread")}</div>
                        <div
                          className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-heading text-[11px] font-bold ${
                            d.spreadRisk === "high" ? "bg-clay/15 text-clay-deep" : d.spreadRisk === "medium" ? "bg-maize/20 text-amber-700" : "bg-leaf/15 text-leaf-deep"
                          }`}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {t(`spread.${d.spreadRisk}` as never)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* urgency strip */}
                {d.severity >= 4 && (
                  <div className="flex items-start gap-2.5 border-t border-clay/20 bg-clay/12 px-6 py-3 text-[13px] font-medium leading-relaxed text-clay-deep">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {d.severity >= 5 ? t("result.urgent.critical") : t("result.urgent")}
                  </div>
                )}
                {d.type === "healthy" && (
                  <div className="flex items-start gap-2.5 border-t border-leaf/20 bg-leaf/10 px-6 py-3 text-[13px] font-medium leading-relaxed text-leaf-deep">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    {t("result.healthy.note")}
                  </div>
                )}

                {/* about */}
                <div className="px-6 py-5">
                  <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-ink-soft/70">{t("result.about")}</h2>
                  <p className="mt-2 font-body text-[14.5px] leading-relaxed text-ink">{lang === "sw" ? d.descSw : d.descEn}</p>
                </div>
              </div>

              {/* treatments */}
              <div className="mt-5 overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-ink/8 px-6 py-4">
                  <h2 className="font-heading text-[15px] font-bold">{t("result.treatment")}</h2>
                  <div className="flex rounded-full border border-ink/15 bg-paper-soft/60 p-1">
                    {(["organic", "chemical"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTreatTab(tab)}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-heading text-xs font-bold transition-colors ${
                          treatTab === tab ? (tab === "organic" ? "bg-leaf text-white" : "bg-clay-deep text-white") : "text-ink-soft"
                        }`}
                      >
                        {tab === "organic" ? <Sprout className="h-3.5 w-3.5" /> : <FlaskConical className="h-3.5 w-3.5" />}
                        {t(`result.${tab}` as never)}
                      </button>
                    ))}
                  </div>
                </div>
                <ul className="space-y-3 px-6 py-5">
                  {(treatTab === "organic" ? (lang === "sw" ? d.organicSw : d.organicEn) : lang === "sw" ? d.chemicalSw : d.chemicalEn).map((tip, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-numeric text-[10px] font-bold ${
                          treatTab === "organic" ? "bg-leaf/15 text-leaf-deep" : "bg-clay/15 text-clay-deep"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="font-body text-[14px] leading-relaxed text-ink">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
                {treatTab === "chemical" && (
                  <div className="border-t border-ink/8 bg-paper-soft/50 px-6 py-3 text-[11.5px] leading-relaxed text-ink-soft">{t("result.chemicalNote")}</div>
                )}
              </div>

              {/* alternatives */}
              {d.alternatives.length > 0 && (
                <div className="mt-4 rounded-2xl border border-ink/10 bg-white/70">
                  <button onClick={() => setShowAlt((v) => !v)} className="flex w-full items-center justify-between px-5 py-3.5">
                    <span className="font-heading text-sm font-bold text-ink-soft">{t("result.also")}</span>
                    <ChevronDown className={`h-4 w-4 text-ink-soft transition-transform ${showAlt ? "rotate-180" : ""}`} />
                  </button>
                  {showAlt && (
                    <div className="space-y-2 border-t border-ink/8 px-5 py-4">
                      {d.alternatives.map((a) => (
                        <div key={a.key} className="flex items-center justify-between rounded-xl bg-paper-soft/70 px-4 py-2.5">
                          <span className="font-heading text-sm font-semibold text-ink">{lang === "sw" ? a.nameSw : a.nameEn}</span>
                          <span className="font-numeric text-xs font-semibold text-ink-soft">{a.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* save state + actions */}
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/60 px-4 py-3">
                <CheckCircle2 className={`h-4 w-4 ${result.recordId ? "text-leaf" : "text-maize"}`} />
                <span className="text-[12.5px] font-heading font-semibold text-ink-soft">
                  {result.recordId ? t("result.saved") : t("result.queued")}
                </span>
                {result.recordId && (
                  <span className="ml-auto font-numeric text-[10px] text-ink-soft/60">#{result.recordId.slice(0, 8)}</span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => reset(false)}
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-leaf-deep font-heading text-sm font-bold text-white shadow-lg shadow-leaf-deep/25 transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <ScanLine className="h-5 w-5" />
                  {t("result.scanAnother")}
                </button>
                <Link
                  href="/records"
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-ink/15 bg-white font-heading text-sm font-bold text-ink transition-colors hover:border-ink/40"
                >
                  <ClipboardList className="h-5 w-5" />
                  {t("result.viewRecords")}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* footer strip */}
        <div className="mt-10 flex items-center justify-center gap-2 text-center text-[11px] text-ink-soft/50">
          <Leaf className="h-3.5 w-3.5" />
          {t("landing.footerNote")}
        </div>
      </main>

      {/* mobile bottom action for step 1 */}
      {step === "crop" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/90 p-4 backdrop-blur-lg">
          <Link
            href="/records"
            className="mx-auto flex h-13 max-w-3xl items-center justify-center gap-2 rounded-2xl border-2 border-ink/15 bg-white py-3.5 font-heading text-sm font-bold text-ink"
          >
            <ClipboardList className="h-5 w-5" />
            {t("nav.records")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
