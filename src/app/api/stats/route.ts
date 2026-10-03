import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { detections } from "@/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";
import { COUNTIES } from "@/lib/kenya";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  try {
    const sp = req.nextUrl.searchParams;
    const crop = sp.get("crop");
    const type = sp.get("type");
    const days = Math.min(365, Math.max(1, Number(sp.get("days") || 90)));

    const since = new Date(Date.now() - days * 24 * 3600 * 1000);
    const clauses = [gte(detections.createdAt, since)];
    if (crop && crop !== "all") clauses.push(eq(detections.crop, crop));
    if (type && type !== "all") clauses.push(eq(detections.detectionType, type));

    const rows = await db
      .select()
      .from(detections)
      .where(and(...clauses))
      .orderBy(desc(detections.createdAt));

    const now = Date.now();
    const DAY = 24 * 3600 * 1000;

    // ---------- weekly series (last 12 buckets aligned to window) ----------
    const nWeeks = Math.min(12, Math.max(4, Math.ceil(days / 7)));
    const buckets: { label: string; disease: number; pest: number; healthy: number }[] = [];
    for (let i = nWeeks - 1; i >= 0; i--) {
      const start = now - (i + 1) * 7 * DAY;
      const end = now - i * 7 * DAY;
      const inBucket = rows.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= start && t < end;
      });
      const d0 = new Date(start + DAY);
      buckets.push({
        label: `${d0.getDate()} ${d0.toLocaleString("en", { month: "short" })}`,
        disease: inBucket.filter((r) => r.detectionType === "disease").length,
        pest: inBucket.filter((r) => r.detectionType === "pest").length,
        healthy: inBucket.filter((r) => r.detectionType === "healthy").length,
      });
    }

    // ---------- headline counters ----------
    const thisWeek = rows.filter((r) => now - new Date(r.createdAt).getTime() < 7 * DAY).length;
    const lastWeek = rows.filter((r) => {
      const age = now - new Date(r.createdAt).getTime();
      return age >= 7 * DAY && age < 14 * DAY;
    }).length;
    const weekDelta = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

    // ---------- by crop ----------
    const byCropMap = new Map<string, number>();
    for (const r of rows) byCropMap.set(r.crop, (byCropMap.get(r.crop) || 0) + 1);

    // ---------- top threats ----------
    const threatMap = new Map<string, { nameEn: string; nameSw: string; type: string; count: number; sevSum: number }>();
    for (const r of rows) {
      if (r.detectionType === "healthy") continue;
      const e = threatMap.get(r.resultKey) || {
        nameEn: r.nameEn,
        nameSw: r.nameSw,
        type: r.detectionType,
        count: 0,
        sevSum: 0,
      };
      e.count++;
      e.sevSum += r.severity;
      threatMap.set(r.resultKey, e);
    }
    const topThreats = Array.from(threatMap.entries())
      .map(([key, v]) => ({
        key,
        nameEn: v.nameEn,
        nameSw: v.nameSw,
        type: v.type,
        count: v.count,
        avgSeverity: Math.round((v.sevSum / v.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 9);

    // ---------- county stats ----------
    const countyMap = new Map<string, { count: number; sevSum: number; recent: number; threats: Map<string, number> }>();
    for (const r of rows) {
      const e = countyMap.get(r.county) || { count: 0, sevSum: 0, recent: 0, threats: new Map<string, number>() };
      e.count++;
      e.sevSum += r.severity;
      if (now - new Date(r.createdAt).getTime() < 7 * DAY) e.recent++;
      if (r.detectionType !== "healthy") e.threats.set(r.nameEn, (e.threats.get(r.nameEn) || 0) + 1);
      countyMap.set(r.county, e);
    }
    const countyStats = COUNTIES.map((c) => {
      const s = countyMap.get(c.name);
      if (!s) return { county: c.name, lat: c.lat, lng: c.lng, count: 0, avgSeverity: 0, recent: 0, topThreat: null as string | null };
      let topThreat: string | null = null;
      let topN = 0;
      for (const [name, n] of s.threats) {
        if (n > topN) {
          topN = n;
          topThreat = name;
        }
      }
      return {
        county: c.name,
        lat: c.lat,
        lng: c.lng,
        count: s.count,
        avgSeverity: s.count ? Math.round((s.sevSum / s.count) * 100) / 100 : 0,
        recent: s.recent,
        topThreat,
      };
    })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    const hotspot = countyStats[0] || null;
    const topThreat = topThreats[0] || null;

    return NextResponse.json({
      ok: true,
      period: { days, labels: buckets.map((b) => b.label) },
      totals: {
        total: rows.length,
        thisWeek,
        weekDelta,
        diseases: rows.filter((r) => r.detectionType === "disease").length,
        pests: rows.filter((r) => r.detectionType === "pest").length,
        healthy: rows.filter((r) => r.detectionType === "healthy").length,
        offline: rows.filter((r) => r.source === "offline-sync").length,
      },
      buckets,
      byCrop: Array.from(byCropMap.entries()).map(([crop, count]) => ({ crop, count })),
      topThreats,
      countyStats,
      hotspot: hotspot ? { county: hotspot.county, count: hotspot.count, avgSeverity: hotspot.avgSeverity } : null,
      topThreat: topThreat ? { nameEn: topThreat.nameEn, nameSw: topThreat.nameSw, count: topThreat.count, type: topThreat.type } : null,
      recent: rows.slice(0, 14).map((r) => ({
        id: r.id,
        crop: r.crop,
        detectionType: r.detectionType,
        nameEn: r.nameEn,
        nameSw: r.nameSw,
        confidence: r.confidence,
        severity: r.severity,
        county: r.county,
        source: r.source,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("stats error", err);
    return NextResponse.json({ ok: false, error: "Failed to compute stats" }, { status: 500 });
  }
}
