import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";
import { countyByName } from "@/lib/kenya";
import { CROPS, type CropKey } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureSeeded();
  try {
    const sp = req.nextUrl.searchParams;
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit") || 20)));
    const county = sp.get("county");

    const rows = await db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(limit);

    const filtered = county
      ? rows.filter((a) => a.county === county || a.county === "All Counties")
      : rows;

    return NextResponse.json({ ok: true, rows: filtered });
  } catch (err) {
    console.error("alerts GET error", err);
    return NextResponse.json({ ok: false, error: "Failed to load alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureSeeded();
  try {
    const body = await req.json();
    const titleEn = String(body.titleEn || "").trim();
    const titleSw = String(body.titleSw || titleEn).trim() || titleEn;
    const messageEn = String(body.messageEn || "").trim();
    const messageSw = String(body.messageSw || messageEn).trim() || messageEn;
    const severity = ["advisory", "watch", "critical"].includes(body.severity) ? body.severity : "watch";
    let county = String(body.county || "All Counties");
    if (county !== "All Counties" && !countyByName(county)) county = "All Counties";
    let crop = String(body.crop || "All Crops");
    if (crop !== "All Crops" && !CROPS.includes(crop.toLowerCase() as CropKey)) crop = "All Crops";

    if (!titleEn || !messageEn) {
      return NextResponse.json({ ok: false, error: "Title and message are required" }, { status: 400 });
    }

    const [row] = await db
      .insert(alerts)
      .values({
        titleEn,
        titleSw,
        messageEn,
        messageSw,
        county,
        crop,
        severity,
        createdBy: String(body.createdBy || "County Plant Health Unit"),
      })
      .returning();

    return NextResponse.json({ ok: true, alert: row });
  } catch (err) {
    console.error("alerts POST error", err);
    return NextResponse.json({ ok: false, error: "Failed to create alert" }, { status: 500 });
  }
}
