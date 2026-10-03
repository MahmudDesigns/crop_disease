import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const dmSans = { variable: "--font-dm" };
const inter = { variable: "--font-inter" };
const plexMono = { variable: "--font-plex" };

export const metadata: Metadata = {
  title: "Shamba AI — Intelligent Crop Disease & Pest Detection",
  description:
    "AI-powered crop disease and pest diagnosis for Kenyan smallholder farmers. Photograph a leaf, get instant diagnosis and treatment advice — in English and Kiswahili, online or offline.",
};

export const viewport: Viewport = {
  themeColor: "#0a100d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-body bg-paper text-ink antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
