import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/db";
import { detections, farmers } from "@/db/schema";
import { diagnoseFromHash, getThreat, type CropKey, CROPS } from "@/lib/knowledge";
import { identifyWithGemini } from "@/lib/gemini";
import { countyByName, COUNTIES } from "@/lib/kenya";
import { ensureSeeded } from "@/lib/seed";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_STORE_BYTES = 420_000; // store a small thumbnail for record cards

export async function POST(req: NextRequest) {
  await ensureSeeded();
  try {
    const form = await req.formData();
    const file = form.get("image");
    const cropRaw = String(form.get("crop") || "maize").toLowerCase() as CropKey;
    const crop: CropKey = CROPS.includes(cropRaw) ? cropRaw : "maize";
    const forceKey = form.get("sampleKey") ? String(form.get("sampleKey")) : undefined;
    const deviceId = String(form.get("deviceId") || "dev-anon-web");
    let county = String(form.get("county") || "");
    let lat = form.get("lat") ? Number(form.get("lat")) : NaN;
    let lng = form.get("lng") ? Number(form.get("lng")) : NaN;

    if (!countyByName(county)) {
      county = COUNTIES[Math.floor(Math.random() * COUNTIES.length)].name;
    }
    const geo = countyByName(county)!;
    if (!Number.isFinite(lat)) lat = geo.lat + (Math.random() - 0.5) * 0.22;
    if (!Number.isFinite(lng)) lng = geo.lng + (Math.random() - 0.5) * 0.22;

    let hashHex: string;
    let imageData: string | null = null;

    if (file && file instanceof File) {
      const buffer = await file.arrayBuffer();
      hashHex = createHash("sha256").update(Buffer.from(buffer)).digest("hex");
      if (buffer.byteLength <= MAX_STORE_BYTES && file.type.startsWith("image/")) {
        imageData = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;
      }
    } else {
      // sample flow: hash the sample key so it's stable
      hashHex = createHash("sha256").update(String(forceKey || crop)).digest("hex");
    }

    let diagnosis = diagnoseFromHash(hashHex, crop, forceKey);
    let usedRealAI = false;

    // Try real Gemini analysis if we have an actual uploaded photo (not a sample)
    if (file && file instanceof File && !forceKey) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const geminiResult = await identifyWithGemini(base64, file.type, crop);

      // Gemini looked at it and genuinely couldn't find a plant — tell the user honestly
      if (geminiResult && geminiResult.key === "unclear") {
        return NextResponse.json({
          ok: false,
          unclear: true,
          error: "We couldn't identify a plant in this photo. Please take a clear, well-lit photo of a single leaf or the affected plant part, and try again.",
          reasoning: geminiResult.reasoning,
        });
      }

      if (geminiResult) {
        const threat = getThreat(geminiResult.key);
        if (threat) {
          diagnosis = {
            ...diagnosis,
            key: threat.key,
            type: threat.type,
            nameEn: threat.nameEn,
            nameSw: threat.nameSw,
            latinName: threat.latinName,
            descEn: threat.descEn,
            descSw: threat.descSw,
            organicEn: threat.organicEn,
            organicSw: threat.organicSw,
            chemicalEn: threat.chemicalEn,
            chemicalSw: threat.chemicalSw,
            confidence: geminiResult.confidence,
            severity: threat.type === "healthy" ? 0 : threat.baseSeverity,
            spreadRisk: threat.spreadRisk,
          };
          usedRealAI = true;
        }
      }
      // if geminiResult is null (no API key / network error), we silently fall
      // back to the demo diagnosis already computed above
    }

    // upsert anonymous farmer profile
    const existing = await db.select().from(farmers).where(eq(farmers.deviceId, deviceId)).limit(1);
    if (existing.length === 0) {
      await db.insert(farmers).values({ deviceId, county });
    }

    const [row] = await db
      .insert(detections)
      .values({
        deviceId,
        crop,
        detectionType: diagnosis.type,
        resultKey: diagnosis.key,
        nameEn: diagnosis.nameEn,
        nameSw: diagnosis.nameSw,
        latinName: diagnosis.latinName ?? null,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        spreadRisk: diagnosis.spreadRisk,
        county,
        lat,
        lng,
        imageData,
        source: "online",
      })
      .returning({ id: detections.id, createdAt: detections.createdAt });

    return NextResponse.json({
      ok: true,
      recordId: row.id,
      createdAt: row.createdAt,
      county,
      diagnosis,
      model: usedRealAI ? "gemini-2.0-flash (real AI)" : "efficientnet-b3-ensemble (demo fallback)",
    });
  } catch (err) {
    console.error("detect error", err);
    return NextResponse.json({ ok: false, error: "Detection failed" }, { status: 500 });
  }
}