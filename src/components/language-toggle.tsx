"use client";

import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border p-1 text-xs font-heading font-semibold ${
        dark ? "border-night-line bg-night-soft text-mint" : "border-ink/15 bg-white/70 text-ink"
      }`}
    >
      <Languages className="ml-1 h-3.5 w-3.5 opacity-60" />
      {(["en", "sw"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1.5 transition-all duration-200 ${
            lang === l
              ? dark
                ? "bg-mint text-night shadow"
                : "bg-leaf-deep text-white shadow"
              : "opacity-60 hover:opacity-100"
          }`}
          aria-pressed={lang === l}
        >
          {l === "en" ? "EN" : "SW"}
        </button>
      ))}
    </div>
  );
}
