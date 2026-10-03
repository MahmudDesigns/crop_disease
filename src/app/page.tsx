"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { CropIcon } from "@/components/crop-icon";
import { SAMPLES, THREATS, THREAT_COUNTS, CROPS, threatsForCrop } from "@/lib/knowledge";
import {
  ScanLine,
  LayoutDashboard,
  Bug,
  Leaf,
  Sprout,
  WifiOff,
  ArrowRight,
  FlaskConical,
  ShieldCheck,
  Radar,
  Sparkles,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Landing() {
  const { t, lang } = useI18n();

  const marqueeItems = THREATS.filter((x) => x.type !== "healthy").map(
    (x) => `${lang === "sw" ? x.nameSw : x.nameEn} · ${t(`crop.${x.crop}` as never)}`,
  );

  return (
    <div className="min-h-screen bg-night text-paper-soft texture-grain">
      <SiteHeader dark active="home" />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-farm.jpg"
            alt="Kenyan smallholder farmer inspecting maize with a smartphone"
            fill
            priority
            className="object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/78 to-night/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/10 px-4 py-1.5 text-[11px] font-heading font-semibold uppercase tracking-[0.18em] text-mint">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.kicker")}
            </span>
          </motion.div>

          <h1 className="mt-6 max-w-3xl font-heading text-[13.5vw] font-bold leading-[0.98] tracking-tight sm:text-7xl">
            {[t("hero.title.a"), t("hero.title.b"), t("hero.title.c")].map((line, i) => (
              <motion.span
                key={line}
                className={`block ${i === 2 ? "text-maize" : i === 1 ? "text-mint" : "text-paper"}`}
                initial={{ opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" }}
                animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.14, ease }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mt-6 max-w-xl font-body text-[15px] leading-relaxed text-paper-soft/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease }}
          >
            {t("hero.sub")}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
          >
            <Link
              href="/scan"
              className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-maize px-7 font-heading text-[15px] font-bold text-night shadow-xl shadow-maize/20 transition-transform hover:scale-[1.03] active:scale-95"
            >
              <ScanLine className="h-5 w-5 transition-transform group-hover:rotate-6" />
              {t("hero.cta.scan")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-14 items-center gap-3 rounded-2xl border border-mint/30 bg-night-card/70 px-7 font-heading text-[15px] font-semibold text-mint backdrop-blur transition-colors hover:border-mint/60 hover:bg-night-card"
            >
              <LayoutDashboard className="h-5 w-5" />
              {t("hero.cta.dashboard")}
            </Link>
          </motion.div>

          <motion.div
            className="mt-14 grid max-w-xl grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease }}
          >
            {[
              {
                n: "95%",
                d: t("hero.stat.accuracy"),
                icon: <ShieldCheck className="h-4 w-4" />,
              },
              { n: String(THREAT_COUNTS.total), d: t("hero.stat.pathogens"), icon: <Bug className="h-4 w-4" /> },
              { n: "100%", d: t("hero.stat.offline"), icon: <WifiOff className="h-4 w-4" /> },
            ].map((s) => (
              <div key={s.d} className="rounded-2xl border border-night-line/70 bg-night-card/60 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-mint-dim">{s.icon}</div>
                <div className="mt-2 font-numeric text-2xl font-semibold text-paper">{s.n}</div>
                <div className="mt-1 text-[11px] font-body leading-snug text-mint-dim">{s.d}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ticker */}
        <div className="relative border-y border-night-line/70 bg-night/80 py-3 backdrop-blur">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap pl-4">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-3 text-[11.5px] font-heading font-medium tracking-wide text-mint-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-maize/70" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AUDIENCE CARDS ============ */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-16 md:grid-cols-2">
        {[
          {
            href: "/scan",
            icon: <ScanLine className="h-7 w-7" />,
            title: t("landing.card.farmer.t"),
            desc: t("landing.card.farmer.d"),
            accent: "maize",
            badge: "01",
          },
          {
            href: "/dashboard",
            icon: <Radar className="h-7 w-7" />,
            title: t("landing.card.officer.t"),
            desc: t("landing.card.officer.d"),
            accent: "mint",
            badge: "02",
          },
        ].map((c, i) => (
          <motion.div
            key={c.href}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease }}
          >
            <Link
              href={c.href}
              className="group relative block overflow-hidden rounded-3xl border border-night-line bg-night-card p-8 transition-colors hover:border-mint/40"
            >
              <span className="absolute -right-4 -top-6 font-numeric text-[110px] font-semibold leading-none text-night-line/50">
                {c.badge}
              </span>
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                  c.accent === "maize" ? "bg-maize/15 text-maize" : "bg-mint/10 text-mint"
                }`}
              >
                {c.icon}
              </div>
              <h3 className="mt-6 font-heading text-2xl font-bold tracking-tight text-paper">{c.title}</h3>
              <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-paper-soft/70">{c.desc}</p>
              <span
                className={`mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold ${
                  c.accent === "maize" ? "text-maize" : "text-mint"
                }`}
              >
                {t("common.viewAll")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* ============ FEATURES ============ */}
      <section className="border-t border-night-line/60 bg-night-soft/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="max-w-2xl"
          >
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
              Shamba AI
            </span>
            <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              {t("feat.title")}
            </h2>
            <p className="mt-4 font-body text-[15px] leading-relaxed text-paper-soft/70">{t("feat.sub")}</p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <ScanLine className="h-6 w-6" />, t: t("feat.1.t"), d: t("feat.1.d") },
              { icon: <FlaskConical className="h-6 w-6" />, t: t("feat.2.t"), d: t("feat.2.d") },
              { icon: <WifiOff className="h-6 w-6" />, t: t("feat.3.t"), d: t("feat.3.d") },
              { icon: <Radar className="h-6 w-6" />, t: t("feat.4.t"), d: t("feat.4.d") },
            ].map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.09, ease }}
                className="rounded-3xl border border-night-line/80 bg-night-card/70 p-6 transition-colors hover:border-mint/30"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-mint/10 text-mint">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-heading text-[17px] font-bold text-paper">{f.t}</h3>
                <p className="mt-2 font-body text-[13px] leading-relaxed text-paper-soft/65">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COVERAGE + SAMPLES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <span className="inline-flex items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            <Sprout className="h-4 w-4" />
            {`${THREAT_COUNTS.diseases} ${lang === "sw" ? "magonjwa" : "diseases"} · ${THREAT_COUNTS.pests} ${lang === "sw" ? "wadudu" : "pests"}`}
          </span>
          <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight text-paper sm:text-5xl">
            {t("coverage.title")}
          </h2>
          <p className="mt-3 font-body text-sm text-paper-soft/70">{t("coverage.sub")}</p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CROPS.map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07, ease }}
              className="rounded-2xl border border-night-line bg-night-card/70 p-5 text-center"
            >
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/10 text-mint">
                <CropIcon crop={c} className="h-7 w-7" />
              </div>
              <div className="mt-3 font-heading text-[15px] font-bold text-paper">{t(`crop.${c}` as never)}</div>
              <div className="mt-1 font-numeric text-[11px] text-mint-dim">
                {threatsForCrop(c).filter((x) => x.type !== "healthy").length}{" "}
                {lang === "sw" ? "viharusi" : "threats"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* sample strip */}
        <div className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 animate-blink rounded-full bg-maize" />
            <h3 className="font-heading text-lg font-bold text-paper">{t("landing.trySample")}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SAMPLES.map((s, i) => (
              <motion.div
                key={s.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
              >
                <Link
                  href={`/scan?sample=${i}`}
                  className="group relative block overflow-hidden rounded-2xl border border-night-line"
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={s.src}
                      alt={s.labelEn}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="flex items-center gap-2 text-mint">
                        <CropIcon crop={s.crop} className="h-4 w-4" />
                        <span className="text-[11px] font-heading font-semibold text-paper">
                          {lang === "sw" ? s.labelSw : s.labelEn}
                        </span>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded-full bg-maize px-2.5 py-1 font-heading text-[10px] font-bold text-night opacity-0 transition-opacity group-hover:opacity-100">
                      Scan →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-night-line/70 bg-night-soft/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-deep text-maize">
              <Leaf className="h-5 w-5" />
            </span>
            <div>
              <div className="font-heading text-sm font-bold text-paper">Shamba AI</div>
              <div className="text-[11px] text-mint-dim">{t("app.tagline")}</div>
            </div>
          </div>
          <p className="max-w-xl text-[11px] leading-relaxed text-mint-dim/80">{t("landing.footerNote")}</p>
          <div className="flex items-center gap-4 text-[11px] font-heading text-mint-dim/80">
            <span className="rounded-full border border-night-line px-3 py-1">English</span>
            <span className="rounded-full border border-night-line px-3 py-1">Kiswahili</span>
            <span className="font-numeric">v0.4-demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
