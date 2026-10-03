"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";
import { pendingCount, syncPending, useOnlineStatus } from "@/lib/offline";
import { ScanLine, LayoutDashboard, ClipboardList, Leaf, Wifi, WifiOff, RefreshCw } from "lucide-react";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center rounded-xl bg-leaf-deep text-maize shadow-lg shadow-leaf-deep/25 ${className}`}>
      <Leaf className="h-[55%] w-[55%]" strokeWidth={2.2} />
    </span>
  );
}

export function OnlinePill({ dark = false }: { dark?: boolean }) {
  const online = useOnlineStatus();
  const { t } = useI18n();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => setPending(await pendingCount()), []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 4000);
    return () => clearInterval(iv);
  }, [refresh]);

  useEffect(() => {
    if (!online) return;
    (async () => {
      const n = await pendingCount();
      if (n > 0) {
        setSyncing(true);
        await syncPending();
        setSyncing(false);
        refresh();
      }
    })();
  }, [online, refresh]);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-heading font-semibold ${
        online
          ? dark
            ? "border-mint/25 bg-mint/10 text-mint"
            : "border-leaf/25 bg-leaf/10 text-leaf-deep"
          : "border-amber-alert/40 bg-amber-alert/15 text-amber-700"
      }`}
    >
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      <span className="whitespace-nowrap">{online ? t("common.online") : t("common.offline")}</span>
      {syncing && <RefreshCw className="h-3 w-3 animate-spin" />}
      {!syncing && pending > 0 && (
        <span className="rounded-full bg-amber-alert px-1.5 py-0.5 font-numeric text-[10px] font-semibold leading-none text-night">
          {pending}
        </span>
      )}
    </div>
  );
}

export function SiteHeader({
  dark = false,
  active,
}: {
  dark?: boolean;
  active?: "home" | "scan" | "records" | "dashboard";
}) {
  const { t } = useI18n();
  const linkBase = "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-heading font-medium transition-colors";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
        dark ? "border-night-line/80 bg-night/85 text-mint" : "border-ink/10 bg-paper/85 text-ink"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="leading-tight">
            <span className="block font-heading text-[17px] font-bold tracking-tight">{t("app.name")}</span>
            <span className={`hidden text-[11px] font-body sm:block ${dark ? "text-mint-dim" : "text-ink-soft/70"}`}>
              {t("app.tagline")}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link
            href="/scan"
            className={`${linkBase} ${
              active === "scan"
                ? dark
                  ? "bg-mint/15 text-mint"
                  : "bg-leaf-deep/10 text-leaf-deep"
                : dark
                  ? "text-mint-dim hover:bg-night-card hover:text-mint"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <ScanLine className="h-4 w-4" />
            {t("nav.farmerApp")}
          </Link>
          <Link
            href="/records"
            className={`${linkBase} ${
              active === "records"
                ? dark
                  ? "bg-mint/15 text-mint"
                  : "bg-leaf-deep/10 text-leaf-deep"
                : dark
                  ? "text-mint-dim hover:bg-night-card hover:text-mint"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            {t("nav.records")}
          </Link>
          <Link
            href="/dashboard"
            className={`${linkBase} ${
              active === "dashboard"
                ? dark
                  ? "bg-mint/15 text-mint"
                  : "bg-leaf-deep/10 text-leaf-deep"
                : dark
                  ? "text-mint-dim hover:bg-night-card hover:text-mint"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("nav.dashboard")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <OnlinePill dark={dark} />
          <LanguageToggle dark={dark} />
        </div>
      </div>
    </header>
  );
}
