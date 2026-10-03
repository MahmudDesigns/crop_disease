"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "sw";

const dict = {
  // ----- common / nav -----
  "app.name": { en: "Shamba AI", sw: "Shamba AI" },
  "app.tagline": {
    en: "Instant crop disease & pest detection",
    sw: "Utambuzi wa papo hapo wa magonjwa na wadudu",
  },
  "nav.farmerApp": { en: "Farmer App", sw: "Programu ya Mkulima" },
  "nav.records": { en: "My Records", sw: "Rekodi Zangu" },
  "nav.dashboard": { en: "Officer Dashboard", sw: "Dashibodi ya Afisa" },
  "nav.home": { en: "Home", sw: "Nyumbani" },
  "common.online": { en: "Online", sw: "Unganisho lipo" },
  "common.offline": { en: "Offline mode", sw: "Hali ya nje ya mtandao" },
  "common.offlineNote": {
    en: "Using on-device model — results will sync when you reconnect.",
    sw: "Inatumia modeli ya ndani — matokeo yatasawazishwa ukiunganisha tena.",
  },
  "common.back": { en: "Back", sw: "Rudi" },
  "common.close": { en: "Close", sw: "Funga" },
  "common.viewAll": { en: "View all", sw: "Ona zote" },
  "common.today": { en: "Today", sw: "Leo" },
  "common.synced": { en: "Synced", sw: "Imesawazishwa" },
  "common.pending": { en: "Pending sync", sw: "Inasubiri kusawazishwa" },

  // ----- landing -----
  "hero.kicker": {
    en: "For Kenya's smallholder farmers",
    sw: "Kwa wakulima wadogo wa Kenya",
  },
  "hero.title.a": { en: "Photograph a leaf.", sw: "Piga picha jani." },
  "hero.title.b": { en: "Know the disease.", sw: "Jua ugonjwa." },
  "hero.title.c": { en: "Save the harvest.", sw: "Okoa mavuno." },
  "hero.sub": {
    en: "AI diagnosis of 27 diseases and pests across maize, beans, tomatoes, potatoes and cassava — with treatment advice in English and Kiswahili, even offline.",
    sw: "Uchunguzi wa AI wa magonjwa na wadudu 27 kwenye mahindi, maharagwe, nyanya, viazi na mihogo — na ushauri wa matibabu kwa Kiingereza na Kiswahili, hata bila mtandao.",
  },
  "hero.cta.scan": { en: "Start scanning", sw: "Anza kuchanganua" },
  "hero.cta.dashboard": { en: "Officer dashboard", sw: "Dashibodi ya afisa" },
  "hero.stat.accuracy": { en: "target accuracy (demo model)", sw: "usahihi lengwa (modeli ya onyesho)" },
  "hero.stat.pathogens": { en: "diseases & pests covered", sw: "magonjwa na wadudu" },
  "hero.stat.offline": { en: "works offline", sw: "inafanya kazi nje ya mtandao" },
  "feat.title": { en: "Built for the field, not the lab", sw: "Imejengwa kwa shamba, si maabara" },
  "feat.sub": {
    en: "Every detail designed for real conditions — bright sun, patchy signal, first smartphones.",
    sw: "Kila kipengele kimeundwa kwa hali halisi — jua kali, mtandao dhaifu, na simu za kwanza.",
  },
  "feat.1.t": { en: "Snap & diagnose", sw: "Piga picha ujue" },
  "feat.1.d": {
    en: "Point your camera at a damaged leaf or pest. Our AI identifies the problem in seconds and scores its confidence.",
    sw: "Elekeza kamera kwenye jani lililoharibika au mdudu. AI yetu hutambua tatizo kwa sekunde chache na kupima uhakika.",
  },
  "feat.2.t": { en: "Treatment you can trust", sw: "Matibabu ya kuaminika" },
  "feat.2.d": {
    en: "Every diagnosis comes with both organic and chemical control options, in plain language a farmer can act on today.",
    sw: "Kila uchunguzi huja na njia za kudhibiti za kiasili na za kemikali, kwa lugha rahisi ambayo mkulima anaweza kutenda leo.",
  },
  "feat.3.t": { en: "Works without signal", sw: "Inafanya bila mtandao" },
  "feat.3.d": {
    en: "A lightweight on-device model keeps working in the field. Results queue up and sync when connectivity returns.",
    sw: "Modeli nyepesi ya ndani inaendelea kufanya kazi shambani. Matokeo huingia foleni na kusawazishwa mtandao ukirudi.",
  },
  "feat.4.t": { en: "Outbreak radar for officers", sw: "Rada ya milipuko kwa maafisa" },
  "feat.4.d": {
    en: "County-level heatmaps, trend charts and instant SMS-style alerts help agricultural officers respond before outbreaks spread.",
    sw: "Ramani za kaunti, chati za mwenendo na tahadhari za haraka husaidia maafisa wa kilimo kuchukua hatua kabla milipuko haijaenea.",
  },
  "coverage.title": { en: "Five staple crops. Twenty-seven threats.", sw: "Mazao makuu matano. Viharusi ishirini na saba." },
  "coverage.sub": { en: "Tap any photo below to try the demo scanner instantly.", sw: "Gusa picha yoyote hapa chini kujaribu kichanganuzi cha onyesho." },
  "landing.trySample": { en: "Try with a sample photo", sw: "Jaribu kwa picha ya mfano" },
  "landing.step": { en: "Step", sw: "Hatua" },
  "landing.footerNote": {
    en: "Demo build — on-device model placeholder with illustrative predictions. Do not rely on results for commercial decisions.",
    sw: "Toleo la onyesho — modeli ya ndani ni kishika nafasi. Usitegemee matokeo kwa maamuzi ya biashara.",
  },

  // ----- crops -----
  "crop.maize": { en: "Maize", sw: "Mahindi" },
  "crop.beans": { en: "Beans", sw: "Maharagwe" },
  "crop.tomato": { en: "Tomato", sw: "Nyanya" },
  "crop.potato": { en: "Potato", sw: "Viazi" },
  "crop.cassava": { en: "Cassava", sw: "Mihogo" },

  // ----- scan flow -----
  "scan.step.crop": { en: "Choose crop", sw: "Chagua zao" },
  "scan.step.photo": { en: "Photo", sw: "Picha" },
  "scan.step.result": { en: "Diagnosis", sw: "Uchunguzi" },
  "scan.pickCrop.title": { en: "What are we scanning today?", sw: "Tunachanganua zao gani leo?" },
  "scan.pickCrop.sub": {
    en: "Select the crop, then photograph one affected leaf or the pest itself.",
    sw: "Chagua zao, kisha piga picha jani moja lililoathirika au mdudu mwenyewe.",
  },
  "scan.tip.title": { en: "For a good photo", sw: "Ili kupata picha nzuri" },
  "scan.tip.1": { en: "Fill the frame with one leaf", sw: "Jaza picha na jani moja" },
  "scan.tip.2": { en: "Use daylight, avoid deep shadow", sw: "Tumia mwanga wa mchana, epuka kivuli" },
  "scan.tip.3": { en: "Hold the phone steady, tap to focus", sw: "Shika simu imara, gusa kulenga" },
  "scan.photo.title": { en: "Add a photo", sw: "Ongeza picha" },
  "scan.photo.sub": {
    en: "Take a new photo or upload one from your gallery.",
    sw: "Piga picha mpya au pakia kutoka maktaba yako.",
  },
  "scan.photo.capture": { en: "Take photo", sw: "Piga picha" },
  "scan.photo.upload": { en: "Upload image", sw: "Pakia picha" },
  "scan.photo.retake": { en: "Retake", sw: "Piga tena" },
  "scan.photo.use": { en: "Analyze this photo", sw: "Changanua picha hii" },
  "scan.photo.dragdrop": { en: "or drag an image here", sw: "au buruta picha hapa" },
  "scan.samples.title": { en: "No camera? Try a sample", sw: "Huna kamera? Jaribu sampuli" },
  "scan.analyzing.title": { en: "Analyzing your crop…", sw: "Inachanganua zao lako…" },
  "scan.analyzing.local": { en: "Running on-device TFLite model", sw: "Inaendesha modeli ya ndani ya TFLite" },
  "scan.analyzing.cloud": { en: "Running EfficientNet-B3 ensemble", sw: "Inaendesha mkusanyiko wa EfficientNet-B3" },
  "scan.analyzing.pre": { en: "Pre-processing image · resize 224×224", sw: "Kuandaa picha · kubadilisha ukubwa 224×224" },
  "scan.analyzing.features": { en: "Extracting lesion & texture features", sw: "Kutoa sifa za michirizi na muonekano" },
  "scan.analyzing.match": { en: "Matching against 27-class pathogen set", sw: "Kulinganisha na viharusi 27" },
  "scan.analyzing.confidence": { en: "Calibrating confidence score", sw: "Kupima kiwango cha uhakika" },

  // ----- result -----
  "result.diagnosis": { en: "Diagnosis", sw: "Uchunguzi" },
  "result.confidence": { en: "Confidence", sw: "Uhakika" },
  "result.severity": { en: "Severity", sw: "Ukali" },
  "result.spread": { en: "Spread risk", sw: "Hatari ya kuenea" },
  "result.type.disease": { en: "Disease", sw: "Ugonjwa" },
  "result.type.pest": { en: "Pest", sw: "Mdudu" },
  "result.type.healthy": { en: "Healthy", sw: "Mzima" },
  "result.about": { en: "About this problem", sw: "Kuhusu tatizo hili" },
  "result.treatment": { en: "Recommended treatment", sw: "Matibabu yanayopendekezwa" },
  "result.organic": { en: "Organic", sw: "Kiasili" },
  "result.chemical": { en: "Chemical", sw: "Kemikali" },
  "result.chemicalNote": {
    en: "Always follow label rates, wear protective gear and respect pre-harvest intervals.",
    sw: "Fuata kipimo cha lebo, vaa mavazi ya kinga na fuata muda wa kabla ya kuvuna.",
  },
  "result.also": { en: "Also possible", sw: "Pengine ni" },
  "result.scanAnother": { en: "Scan another crop", sw: "Changanua zao lingine" },
  "result.viewRecords": { en: "View my records", sw: "Ona rekodi zangu" },
  "result.saved": { en: "Saved to your records", sw: "Imehifadhiwa kwenye rekodi zako" },
  "result.queued": { en: "Queued — will sync automatically", sw: "Imewekwa foleni — itasawazishwa kiotomatiki" },
  "result.modelBadge.local": { en: "On-device model · TFLite", sw: "Modeli ya ndani · TFLite" },
  "result.modelBadge.cloud": { en: "Cloud model · EfficientNet-B3", sw: "Modeli ya wingu · EfficientNet-B3" },
  "result.healthy.note": {
    en: "No disease or pest pressure detected. Keep monitoring weekly, especially after rains.",
    sw: "Hakuna ugonjwa wala mdudu uliotambuliwa. Endelea kuchunguza kila wiki, hasa baada ya mvua.",
  },
  "result.urgent": {
    en: "Act within 48 hours — this spreads fast in warm, wet weather.",
    sw: "Chukua hatua ndani ya saa 48 — huenea haraka kwa hali ya joto na unyevu.",
  },
  "result.urgent.critical": {
    en: "CRITICAL: isolate affected plants immediately and alert your ward agricultural officer.",
    sw: "MUHIMU: tenga mimea iliyoathirika mara moja na mjuulishe afisa kilimo wa kata yako.",
  },

  // ----- severity / spread -----
  "sev.0": { en: "None", sw: "Hakuna" },
  "sev.1": { en: "Very low", sw: "Kidogo sana" },
  "sev.2": { en: "Low", sw: "Kidogo" },
  "sev.3": { en: "Moderate", sw: "Wastani" },
  "sev.4": { en: "High", sw: "Juu" },
  "sev.5": { en: "Severe", sw: "Kubwa sana" },
  "spread.low": { en: "Low", sw: "Chini" },
  "spread.medium": { en: "Medium", sw: "Wastani" },
  "spread.high": { en: "High", sw: "Juu" },

  // ----- records -----
  "records.title": { en: "My scan records", sw: "Rekodi zangu za uchanganuzi" },
  "records.sub": {
    en: "Every diagnosis from this device, newest first. Data stays anonymous — only county-level location is stored.",
    sw: "Kila uchunguzi kutoka kifaa hiki, mapya kwanza. Data hubaki faragha — eneo la kaunti pekee ndilo linahifadhiwa.",
  },
  "records.empty": { en: "No scans yet", sw: "Bado hakuna uchanganuzi" },
  "records.emptyCta": { en: "Scan your first crop", sw: "Changanua zao lako la kwanza" },
  "records.filter.all": { en: "All crops", sw: "Mazao yote" },

  // ----- dashboard -----
  "dash.title": { en: "Plant Health Command", sw: "Kituo cha Afya ya Mimea" },
  "dash.sub": {
    en: "National outbreak monitoring — Ministry of Agriculture · demo workspace",
    sw: "Ufuatiliaji wa milipuko kitaifa — Wizara ya Kilimo · eneo la onyesho",
  },
  "dash.stat.week": { en: "Detections this week", sw: "Uchunguzi wiki hii" },
  "dash.stat.trend": { en: "vs previous week", sw: "ikilinganishwa na wiki iliyopita" },
  "dash.stat.activeAlerts": { en: "Active alerts", sw: "Tahadhari zilizo hai" },
  "dash.stat.hotspot": { en: "Top hotspot county", sw: "Kaunti yenye hatari kubwa" },
  "dash.stat.topThreat": { en: "Dominant threat", sw: "Tishio kubwa" },
  "dash.map.title": { en: "Outbreak map", sw: "Ramani ya milipuko" },
  "dash.map.sub": { en: "Detections per county — sized by volume, coloured by mean severity", sw: "Uchunguzi kwa kaunti — ukubwa kwa wingi, rangi kwa ukali" },
  "dash.map.det": { en: "detections", sw: "uchunguzi" },
  "dash.trend.title": { en: "12-week trend", sw: "Mwenendo wa wiki 12" },
  "dash.trend.sub": { en: "Disease vs pest detections, all counties", sw: "Magonjwa dhidi ya wadudu, kaunti zote" },
  "dash.threats.title": { en: "Top threats", sw: "Viharusi vikuu" },
  "dash.threats.sub": { en: "Ranked by detections in selected period", sw: "Kwa mpangilio wa uchunguzi katika kipindi" },
  "dash.counties.title": { en: "County watchlist", sw: "Orodha ya kaunti" },
  "dash.counties.sub": { en: "Where pressure is building", sw: "Mahali hatari inapoongezeka" },
  "dash.alerts.title": { en: "Alerts to farmers", sw: "Tahadhari kwa wakulima" },
  "dash.alerts.compose": { en: "Compose alert", sw: "Tunga tahadhari" },
  "dash.alerts.empty": { en: "No alerts issued yet", sw: "Hakuna tahadhari iliyotumwa bado" },
  "dash.live.title": { en: "Live detection feed", sw: "Mtiririko wa uchunguzi" },
  "dash.live.sub": { en: "Latest farmer submissions, including offline-synced records", sw: "Mawasilisho mapya ya wakulima, pamoja na yaliyosawazishwa" },
  "dash.filter.crop": { en: "Crop", sw: "Zao" },
  "dash.filter.type": { en: "Type", sw: "Aina" },
  "dash.filter.days": { en: "Period", sw: "Kipindi" },
  "dash.filter.all": { en: "All", sw: "Yote" },
  "dash.filter.allCrops": { en: "All crops", sw: "Mazao yote" },
  "dash.filter.allTypes": { en: "All types", sw: "Aina zote" },
  "dash.days.7": { en: "7 days", sw: "Siku 7" },
  "dash.days.14": { en: "14 days", sw: "Siku 14" },
  "dash.days.30": { en: "30 days", sw: "Siku 30" },
  "dash.days.90": { en: "90 days", sw: "Siku 90" },
  "dash.AlertForm.title": { en: "New regional alert", sw: "Tahadhari mpya ya kikanda" },
  "dash.alertForm.subEn": { en: "English message", sw: "Ujumbe wa Kiingereza" },
  "dash.alertForm.subSw": { en: "Kiswahili message", sw: "Ujumbe wa Kiswahili" },
  "dash.alertForm.county": { en: "County", sw: "Kaunti" },
  "dash.alertForm.crop": { en: "Crop", sw: "Zao" },
  "dash.alertForm.severity": { en: "Level", sw: "Kiwango" },
  "dash.alertForm.send": { en: "Broadcast alert", sw: "Tuma tahadhari" },
  "dash.alertForm.sending": { en: "Broadcasting…", sw: "Inatuma…" },
  "dash.alertForm.hint": {
    en: "Alert appears instantly on farmers' phones in the selected county, in their chosen language.",
    sw: "Tahadhari itaonekana mara moja kwenye simu za wakulima wa kaunti hiyo, kwa lugha waliyochagua.",
  },
  "dash.alertSent": { en: "Alert broadcast to farmers", sw: "Tahadhari imetumwa kwa wakulima" },
  "sev.advisory": { en: "Advisory", sw: "Ushauri" },
  "sev.watch": { en: "Watch", sw: "Tahadhari" },
  "sev.critical": { en: "Critical", sw: "Hatari kubwa" },
  "dash.table.id": { en: "ID", sw: "ID" },
  "dash.table.crop": { en: "Crop", sw: "Zao" },
  "dash.table.result": { en: "Finding", sw: "Matokeo" },
  "dash.table.county": { en: "County", sw: "Kaunti" },
  "dash.table.conf": { en: "Conf.", sw: "Uhakika" },
  "dash.table.time": { en: "Time", sw: "Muda" },
  "dash.table.source": { en: "Source", sw: "Chanzo" },
  "dash.alertsOnPhone.title": { en: "Alerts in your area", sw: "Tahadhari za eneo lako" },

  // home dashboard link card
  "landing.card.farmer.t": { en: "I'm a farmer", sw: "Mimi ni mkulima" },
  "landing.card.farmer.d": {
    en: "Scan a leaf or pest, get diagnosis and treatment in seconds.",
    sw: "Changanua jani au mdudu, pata uchunguzi na matibabu kwa sekunde chache.",
  },
  "landing.card.officer.t": { en: "I'm an agricultural officer", sw: "Mimi ni afisa kilimo" },
  "landing.card.officer.d": {
    en: "Monitor county outbreaks, analyze trends and broadcast alerts.",
    sw: "Fuatilia milipuko ya kaunti, chambua mwenendo na upeleke tahadhari.",
  },
} as const;

export type DictKey = keyof typeof dict;

function t_raw(lang: Lang, key: DictKey): string {
  const entry = dict[key];
  return entry[lang] ?? entry.en;
}

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => t_raw("en", k) });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shamba-lang");
      if (saved === "en" || saved === "sw") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("shamba-lang", l);
    } catch {}
  };

  const value = useMemo<I18nCtx>(
    () => ({ lang, setLang, t: (key) => t_raw(lang, key) }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

export function translate(lang: Lang, key: DictKey): string {
  return t_raw(lang, key);
}
