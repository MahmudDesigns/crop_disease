/**
 * Demo seed generator: builds 12 weeks of plausible detection history
 * with realistic outbreak waves (fall armyworm in the maize belt, potato
 * late blight in the highlands, CBSD along the coast). Idempotent.
 */
import { db } from "@/db";
import { detections, alerts, farmers } from "@/db/schema";
import { COUNTIES } from "@/lib/kenya";
import { threatsForCrop, type CropKey } from "@/lib/knowledge";
import { sql } from "drizzle-orm";

/* deterministic PRNG so reseeding is stable */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20250617);

function pickWeighted<T>(items: T[], weight: (t: T) => number): T {
  const total = items.reduce((s, i) => s + weight(i), 0);
  let r = rand() * total;
  for (const item of items) {
    r -= weight(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

const HOTSPOT_GROUPS = {
  maizeBelt: ["Trans Nzoia", "Uasin Gishu", "Nakuru", "Narok", "Nandi", "Bungoma"],
  potatoHighlands: ["Nyandarua", "Meru", "Nyeri", "Bomet", "Laikipia"],
  coast: ["Kilifi", "Kwale", "Tana River", "Lamu", "Mombasa"],
};

/** Outbreak multipliers keyed by threat, evolving over the 12-week window. */
function outbreakMultiplier(key: string, county: string, weekIndex: number): number {
  // weeks 0..11 (0 = oldest)
  if (key === "fall_armyworm" && HOTSPOT_GROUPS.maizeBelt.includes(county)) {
    if (weekIndex >= 4 && weekIndex <= 8) return 6.5; // big wave
    if (weekIndex > 8) return 3; // lingering pressure
  }
  if (key === "late_blight_potato" && HOTSPOT_GROUPS.potatoHighlands.includes(county)) {
    if (weekIndex >= 8) return 8; // current, escalating
    if (weekIndex >= 5) return 2.5;
  }
  if (key === "tuta_absoluta") {
    if (weekIndex >= 6 && (county === "Kirinyaga" || county === "Kajiado" || county === "Machakos")) return 4.5;
  }
  if (key === "cassava_brown_streak" && HOTSPOT_GROUPS.coast.includes(county)) {
    return 1.5 + weekIndex * 0.55; // slow creep upward
  }
  if (key === "cassava_mosaic" && (county === "Busia" || county === "Siaya" || county === "Homa Bay")) {
    return 3.2;
  }
  if (key === "mln" && HOTSPOT_GROUPS.maizeBelt.includes(county) && weekIndex >= 2 && weekIndex <= 6) {
    return 3.4;
  }
  if (key === "angular_leaf_spot" && (county === "Kisii" || county === "Nyamira" || county === "Embu")) {
    return 2.6;
  }
  if (key === "tylcv" && (county === "Kajiado" || county === "Taita Taveta")) return 2.4;
  return 1;
}

const SPREAD: Record<string, string> = {};

export async function ensureSeeded(): Promise<void> {
  const [{ value: existing }] = await db
    .select({ value: sql<number>`count(*)` })
    .from(detections);
  if (Number(existing) > 0) return;

  // anonymized farmer pool
  const farmerIds: string[] = [];
  for (let i = 1; i <= 46; i++) {
    farmerIds.push(`dev-anon-${String(i).padStart(3, "0")}`);
  }
  await db.insert(farmers).values(
    farmerIds.map((deviceId, i) => ({
      deviceId,
      displayName: null,
      county: COUNTIES[i % COUNTIES.length].name,
      language: rand() > 0.5 ? "sw" : "en",
    })),
  );

  const rows: (typeof detections.$inferInsert)[] = [];
  const weeks = 12;
  const total = 760;
  const now = Date.now();

  for (let i = 0; i < total; i++) {
    // pick week (slightly more activity in recent weeks)
    const w = Math.min(weeks - 1, Math.floor(Math.pow(rand(), 0.85) * weeks));

    // outbreak-aware county/crop selection
    let county = pickWeighted(COUNTIES, (c) =>
      Math.max(0.15, c.crops.maize + c.crops.beans + c.crops.tomato + c.crops.potato + c.crops.cassava),
    );
    // bias toward hotspots during their waves
    if (rand() < 0.34) {
      const group = w >= 8 ? HOTSPOT_GROUPS.potatoHighlands : HOTSPOT_GROUPS.maizeBelt;
      const name = group[Math.floor(rand() * group.length)];
      const found = COUNTIES.find((c) => c.name === name);
      if (found) county = found;
    }

    const crop = pickWeighted<Exclude<CropKey, never>>(
      ["maize", "beans", "tomato", "potato", "cassava"],
      (k) => Math.max(0.25, county.crops[k]),
    );

    const pool = threatsForCrop(crop);
    const threat = pickWeighted(pool, (t) => {
      let wgt = t.prevalence * outbreakMultiplier(t.key, county.name, w);
      if (t.type === "healthy") wgt *= 0.35; // farmers mostly scan problems
      return wgt;
    });

    const spread =
      threat.spreadRisk ?? "medium";
    SPREAD[threat.key] = spread;

    const dayInWeek = Math.floor(rand() * 7);
    const age = (weeks - 1 - w) * 7 + (6 - dayInWeek);
    const createdAt = new Date(now - age * 24 * 60 * 60 * 1000 - rand() * 10 * 3600 * 1000);

    rows.push({
      deviceId: farmerIds[Math.floor(rand() * farmerIds.length)],
      crop,
      detectionType: threat.type,
      resultKey: threat.key,
      nameEn: threat.nameEn,
      nameSw: threat.nameSw,
      latinName: threat.latinName ?? null,
      confidence: 71 + Math.floor(rand() * 28),
      severity: threat.type === "healthy" ? 0 : threat.baseSeverity,
      spreadRisk: threat.spreadRisk,
      county: county.name,
      lat: county.lat + (rand() - 0.5) * 0.3,
      lng: county.lng + (rand() - 0.5) * 0.3,
      imageData: null,
      source: rand() < 0.12 ? "offline-sync" : "simulated",
      createdAt,
    });
  }

  // chunked insert
  const CHUNK = 150;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(detections).values(rows.slice(i, i + CHUNK));
  }

  await db.insert(alerts).values([
    {
      titleEn: "Fall Armyworm surge in the maize belt",
      titleSw: "Ongezeko la vifunjavifunja ukanda wa mahindi",
      messageEn:
        "Scout your maize twice a week and check the funnel for caterpillars and frass. Apply Bt or neem extract early; spray emamectin benzoate into the whorl if you find more than 5 affected plants out of 20. Report heavy infestations to your ward officer.",
      messageSw:
        "Chunguza mahindi yako mara mbili kwa wiki na uangalie moyo wa mmea kwa viwavijeshi na kinyesi. Tumia Bt au mwarobaini mapema; nyunyizia emamectin benzoate moyoni ukipata mimea zaidi ya 5 kati ya 20 imeathirika. Ripoti uvamizi mkubwa kwa afisa wa kata yako.",
      county: "Trans Nzoia",
      crop: "maize",
      severity: "critical",
      createdAt: new Date(now - 6 * 24 * 3600 * 1000),
    },
    {
      titleEn: "Late blight risk high in potato highlands",
      titleSw: "Hatari kubwa ya uoza wa kuchelewa nyanda za juu",
      messageEn:
        "Misty, wet weather favours late blight in Nyandarua, Meru and Laikipia. Keep a protective copper or mancozeb cover, hill up well, and remove any plant with water-soaked leaf patches. Cut and burn infected foliage before harvesting.",
      messageSw:
        "Hali ya ukungu na mvua hupendelea uoza wa kuchelewa Nyandarua, Meru na Laikipia. Endelea na dawa za kinga za shaba au mancozeb, funika vizuri, na uondoe mmea wowote wenye mabaka ya maji majanini. Kata na uteketeze majani yaliyoambukizwa kabla ya kuvuna.",
      county: "Nyandarua",
      crop: "potato",
      severity: "watch",
      createdAt: new Date(now - 2 * 24 * 3600 * 1000),
    },
    {
      titleEn: "CBSD watch — coastal cassava counties",
      titleSw: "Tahadhari ya CBSD — kaunti za pwani za mihogo",
      messageEn:
        "Brown streak disease continues to spread along the coast. Use only certified clean cuttings, check roots before sharing planting material, and report plants with brown stem streaks. There is no cure once roots are affected.",
      messageSw:
        "Ugonjwa wa mistari ya kahawia unaendelea kusambaa pwani. Tumia vipande safi vilivyoidhinishwa pekee, kagua mizizi kabla ya kusambaza vipande, na uripoti mimea yenye mistari ya kahawia shanani. Hakuna tiba mizizi ikishaathirika.",
      county: "Kilifi",
      crop: "cassava",
      severity: "advisory",
      createdAt: new Date(now - 11 * 24 * 3600 * 1000),
    },
  ]);
}
