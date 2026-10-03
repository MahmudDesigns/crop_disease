import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { detections, farmers } from "@/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  try {
    const sp = req.nextUrl.searchParams;
    const deviceId = sp.get("deviceId");
    const county = sp.get("county");
    const crop = sp.get("crop");
    const type = sp.get("type");
    const days = Math.min(365, Math.max(1, Number(sp.get("days") || 90)));
    const limit = Math.min(500, Math.max(1, Number(sp.get("limit") || 100)));

    const clauses = [gte(detections.createdAt, new Date(Date.now() - days * 24 * 3600 * 1000))];
    if (deviceId) clauses.push(eq(detections.deviceId, deviceId));
    if (county && county !== "all") clauses.push(eq(detections.county, county));
    if (crop && crop !== "all") clauses.push(eq(detections.crop, crop));
    if (type && type !== "all") clauses.push(eq(detections.detectionType, type));

    const rows = await db
      .select()
      .from(detections)
      .where(and(...clauses))
      .orderBy(desc(detections.createdAt))
      .limit(limit);

    return NextResponse.json({ ok: true, count: rows.length, rows });
  } catch (err) {
    console.error("detections GET error", err);
    return NextResponse.json({ ok: false, error: "Failed to load detections" }, { status: 500 });
  }
}

/** Offline-sync endpoint: a queued diagnosis made by the on-device model. */
export async function POST(req: NextRequest) {
  await ensureSeeded();
  try {
    const body = await req.json();
    const deviceId = String(body.deviceId || "dev-anon-web");

    const existing = await db.select().from(farmers).where(eq(farmers.deviceId, deviceId)).limit(1);
    if (existing.length === 0) {
      await db.insert(farmers).values({ deviceId, county: body.county || "Nakuru" });
    }

    const [row] = await db
      .insert(detections)
      .values({
        deviceId,
        crop: String(body.crop || "maize"),
        detectionType: String(body.detectionType || "disease"),
        resultKey: String(body.resultKey || "unknown"),
        nameEn: String(body.nameEn || "Unknown"),
        nameSw: String(body.nameSw || "Haijulikani"),
        latinName: body.latinName ? String(body.latinName) : null,
        confidence: Math.min(100, Math.max(0, Number(body.confidence) || 70)),
        severity: Math.min(5, Math.max(0, Number(body.severity) || 1)),
        spreadRisk: String(body.spreadRisk || "medium"),
        county: String(body.county || "Nakuru"),
        lat: body.lat != null ? Number(body.lat) : null,
        lng: body.lng != null ? Number(body.lng) : null,
        imageData: typeof body.imageData === "string" ? body.imageData : null,
        source: String(body.source || "offline-sync"),
        createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      })
      .returning({ id: detections.id });

    return NextResponse.json({ ok: true, recordId: row.id });
  } catch (err) {
    console.error("detections POST error", err);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
