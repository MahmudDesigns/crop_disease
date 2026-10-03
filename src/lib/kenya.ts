/**
 * Kenya county geography: approximate county centroids used to project
 * detections onto the stylised SVG map, plus agricultural weighting
 * used by the seed generator. Projection domain is deliberately padded
 * so the outline fits a square canvas.
 */

export interface County {
  name: string;
  lat: number;
  lng: number;
  // relative crop importance for seeding (0 = negligible)
  crops: { maize: number; beans: number; tomato: number; potato: number; cassava: number };
}

export const COUNTIES: County[] = [
  { name: "Trans Nzoia", lat: 1.02, lng: 34.98, crops: { maize: 10, beans: 4, tomato: 2, potato: 1, cassava: 0 } },
  { name: "Uasin Gishu", lat: 0.52, lng: 35.27, crops: { maize: 10, beans: 4, tomato: 2, potato: 1, cassava: 0 } },
  { name: "Nakuru", lat: -0.28, lng: 36.07, crops: { maize: 8, beans: 5, tomato: 4, potato: 4, cassava: 0 } },
  { name: "Narok", lat: -1.08, lng: 35.87, crops: { maize: 7, beans: 5, tomato: 2, potato: 3, cassava: 0 } },
  { name: "Bungoma", lat: 0.56, lng: 34.57, crops: { maize: 8, beans: 7, tomato: 2, potato: 0, cassava: 2 } },
  { name: "Kakamega", lat: 0.28, lng: 34.75, crops: { maize: 7, beans: 5, tomato: 2, potato: 0, cassava: 3 } },
  { name: "Nandi", lat: 0.18, lng: 35.18, crops: { maize: 7, beans: 3, tomato: 1, potato: 2, cassava: 0 } },
  { name: "Elgeyo Marakwet", lat: 0.83, lng: 35.45, crops: { maize: 5, beans: 3, tomato: 1, potato: 3, cassava: 0 } },
  { name: "West Pokot", lat: 1.24, lng: 35.11, crops: { maize: 5, beans: 3, tomato: 1, potato: 2, cassava: 0 } },
  { name: "Kericho", lat: -0.37, lng: 35.29, crops: { maize: 4, beans: 4, tomato: 2, potato: 3, cassava: 0 } },
  { name: "Bomet", lat: -0.78, lng: 35.34, crops: { maize: 4, beans: 4, tomato: 2, potato: 5, cassava: 0 } },
  { name: "Nyandarua", lat: -0.3, lng: 36.38, crops: { maize: 3, beans: 4, tomato: 2, potato: 10, cassava: 0 } },
  { name: "Meru", lat: 0.05, lng: 37.66, crops: { maize: 5, beans: 6, tomato: 3, potato: 7, cassava: 0 } },
  { name: "Nyeri", lat: -0.42, lng: 36.94, crops: { maize: 3, beans: 4, tomato: 2, potato: 6, cassava: 0 } },
  { name: "Laikipia", lat: 0.35, lng: 36.78, crops: { maize: 4, beans: 3, tomato: 3, potato: 5, cassava: 0 } },
  { name: "Kirinyaga", lat: -0.5, lng: 37.28, crops: { maize: 3, beans: 5, tomato: 8, potato: 2, cassava: 0 } },
  { name: "Murang'a", lat: -0.72, lng: 37.14, crops: { maize: 3, beans: 5, tomato: 4, potato: 4, cassava: 0 } },
  { name: "Kiambu", lat: -1.17, lng: 36.83, crops: { maize: 3, beans: 4, tomato: 5, potato: 3, cassava: 0 } },
  { name: "Embu", lat: -0.53, lng: 37.45, crops: { maize: 4, beans: 8, tomato: 3, potato: 2, cassava: 0 } },
  { name: "Tharaka Nithi", lat: -0.3, lng: 37.72, crops: { maize: 3, beans: 7, tomato: 3, potato: 1, cassava: 0 } },
  { name: "Kisii", lat: -0.68, lng: 34.77, crops: { maize: 5, beans: 8, tomato: 3, potato: 4, cassava: 2 } },
  { name: "Nyamira", lat: -0.57, lng: 34.94, crops: { maize: 5, beans: 8, tomato: 3, potato: 4, cassava: 1 } },
  { name: "Migori", lat: -1.06, lng: 34.48, crops: { maize: 5, beans: 4, tomato: 2, potato: 0, cassava: 7 } },
  { name: "Homa Bay", lat: -0.53, lng: 34.46, crops: { maize: 4, beans: 4, tomato: 2, potato: 0, cassava: 8 } },
  { name: "Siaya", lat: 0.06, lng: 34.29, crops: { maize: 4, beans: 4, tomato: 2, potato: 0, cassava: 9 } },
  { name: "Busia", lat: 0.43, lng: 34.25, crops: { maize: 4, beans: 3, tomato: 2, potato: 0, cassava: 9 } },
  { name: "Kisumu", lat: -0.09, lng: 34.77, crops: { maize: 3, beans: 3, tomato: 3, potato: 0, cassava: 6 } },
  { name: "Vihiga", lat: 0.05, lng: 34.72, crops: { maize: 3, beans: 5, tomato: 2, potato: 1, cassava: 3 } },
  { name: "Machakos", lat: -1.52, lng: 37.26, crops: { maize: 3, beans: 7, tomato: 6, potato: 0, cassava: 1 } },
  { name: "Makueni", lat: -1.8, lng: 37.62, crops: { maize: 3, beans: 6, tomato: 5, potato: 0, cassava: 2 } },
  { name: "Kitui", lat: -1.37, lng: 38.01, crops: { maize: 3, beans: 6, tomato: 4, potato: 0, cassava: 2 } },
  { name: "Kajiado", lat: -2.09, lng: 36.78, crops: { maize: 2, beans: 3, tomato: 8, potato: 1, cassava: 0 } },
  { name: "Taita Taveta", lat: -3.4, lng: 38.36, crops: { maize: 2, beans: 3, tomato: 7, potato: 2, cassava: 1 } },
  { name: "Kilifi", lat: -3.63, lng: 39.85, crops: { maize: 2, beans: 2, tomato: 3, potato: 0, cassava: 9 } },
  { name: "Kwale", lat: -4.18, lng: 39.45, crops: { maize: 2, beans: 2, tomato: 2, potato: 0, cassava: 9 } },
  { name: "Mombasa", lat: -4.05, lng: 39.67, crops: { maize: 1, beans: 1, tomato: 4, potato: 0, cassava: 5 } },
  { name: "Tana River", lat: -1.5, lng: 39.9, crops: { maize: 2, beans: 2, tomato: 3, potato: 0, cassava: 6 } },
  { name: "Lamu", lat: -2.27, lng: 40.9, crops: { maize: 1, beans: 1, tomato: 2, potato: 0, cassava: 7 } },
  { name: "Nairobi", lat: -1.29, lng: 36.82, crops: { maize: 1, beans: 2, tomato: 5, potato: 1, cassava: 0 } },
];

export function countyByName(name: string): County | undefined {
  return COUNTIES.find((c) => c.name === name);
}

/* ---- SVG projection ---- */
export const MAP = {
  width: 560,
  height: 620,
  minLon: 33.4,
  maxLon: 42.4,
  minLat: -5.1,
  maxLat: 5.6,
};

export function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MAP.minLon) / (MAP.maxLon - MAP.minLon)) * MAP.width;
  const y = ((MAP.maxLat - lat) / (MAP.maxLat - MAP.minLat)) * MAP.height;
  return { x, y };
}

/**
 * Stylised Kenya outline (simplified, smoothed). Vertex pairs are lon/lat,
 * projected at render time so all geometry shares one projection.
 */
const OUTLINE_LL: [number, number][] = [
  [39.2, -4.62],
  [38.45, -4.02],
  [37.62, -3.4],
  [36.85, -2.75],
  [36.1, -2.3],
  [35.0, -1.55],
  [33.95, -1.0],
  [34.05, -0.35],
  [33.85, 0.35],
  [34.55, 0.45],
  [34.75, 1.0],
  [34.45, 1.7],
  [34.25, 2.55],
  [34.1, 3.45],
  [33.95, 4.25],
  [35.3, 4.9],
  [35.97, 4.47],
  [36.85, 4.45],
  [37.9, 4.05],
  [39.05, 3.52],
  [40.4, 3.85],
  [41.85, 3.97],
  [41.6, 3.3],
  [41.0, 2.8],
  [40.98, 1.7],
  [41.0, 0.6],
  [40.85, -0.55],
  [40.98, -1.55],
  [41.55, -1.72],
  [41.0, -2.25],
  [40.45, -2.7],
  [40.1, -3.25],
  [39.78, -3.75],
  [39.68, -4.05],
  [39.2, -4.62],
];

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 3) return "";
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
  let d = `M ${mid(points[0], points[1]).x.toFixed(1)} ${mid(points[0], points[1]).y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const next = points[(i + 1) % points.length];
    const m = mid(p, next);
    d += ` Q ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)}`;
  }
  return d + " Z";
}

export function kenyaOutlinePath(): string {
  return smoothPath(OUTLINE_LL.map(([lng, lat]) => project(lat, lng)));
}

/** Lake Turkana sliver (decorative). */
export function lakeTurkanaPath(): string {
  const pts = [
    { x: 36.7, y: 4.2 },
    { x: 36.35, y: 3.6 },
    { x: 36.45, y: 2.6 },
    { x: 36.05, y: 2.5 },
    { x: 36.1, y: 3.6 },
  ].map((p) => project(p.y, p.x));
  return smoothPath(pts);
}

/** Lake Victoria sliver at the SW border (decorative). */
export function lakeVictoriaPath(): string {
  const pts = [
    { x: 33.4, y: -0.35 },
    { x: 34.3, y: -0.1 },
    { x: 33.95, y: -1.0 },
    { x: 33.4, y: -1.05 },
  ].map((p) => project(p.y, p.x));
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
}
