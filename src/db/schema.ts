import { pgTable, uuid, text, integer, real, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Farmers are keyed by an anonymous deviceId — no PII is required.
 * displayName is optional; officers only ever see anonymized records.
 */
export const farmers = pgTable("farmers", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  displayName: text("display_name"),
  county: text("county"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const detections = pgTable(
  "detections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deviceId: text("device_id").notNull(),
    crop: text("crop").notNull(), // maize | beans | tomato | potato | cassava
    detectionType: text("detection_type").notNull(), // disease | pest | healthy
    resultKey: text("result_key").notNull(),
    nameEn: text("name_en").notNull(),
    nameSw: text("name_sw").notNull(),
    latinName: text("latin_name"),
    confidence: integer("confidence").notNull(), // 0-100
    severity: integer("severity").notNull(), // 0-5
    spreadRisk: text("spread_risk").notNull().default("medium"), // low | medium | high
    county: text("county").notNull(),
    lat: real("lat"),
    lng: real("lng"),
    imageData: text("image_data"), // small data-url thumbnail, nullable
    source: text("source").notNull().default("online"), // online | offline-sync | simulated
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("detections_created_idx").on(t.createdAt),
    index("detections_county_idx").on(t.county),
    index("detections_device_idx").on(t.deviceId),
  ],
);

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  titleEn: text("title_en").notNull(),
  titleSw: text("title_sw").notNull(),
  messageEn: text("message_en").notNull(),
  messageSw: text("message_sw").notNull(),
  county: text("county").notNull().default("All Counties"),
  crop: text("crop").notNull().default("All Crops"),
  severity: text("severity").notNull().default("watch"), // advisory | watch | critical
  createdBy: text("created_by").notNull().default("Plant Health Unit"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
