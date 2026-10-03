import { THREATS, type CropKey } from "./knowledge";

const MODEL = "gemini-3.8-flash";

export interface GeminiResult {
  key: string;
  confidence: number;
  reasoning: string;
}

export async function identifyWithGemini(
  imageBase64: string,
  mimeType: string,
  crop: CropKey,
): Promise<GeminiResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set — skipping real AI detection");
    return null;
  }

  const pool = THREATS.filter((t) => t.crop === crop);
  const optionsList = pool
    .map((t) => `- "${t.key}": ${t.nameEn} (${t.type})${t.latinName ? ` — ${t.latinName}` : ""}`)
    .join("\n");

  const prompt = `You are an expert plant pathologist analyzing a photo that is supposed to show a ${crop} plant from a Kenyan smallholder farm.

FIRST, verify the image actually shows a plant leaf, stem, or crop material. If the image shows anything else — a screenshot, document, text, advert, person, animal, random object, or any photo that is not a plant — you MUST respond with key "unclear". Do not guess a disease just because you were asked to; only diagnose if you can genuinely see plant material.

If — and only if — the image genuinely shows a plant, decide which ONE of these known conditions it most closely matches:
${optionsList}

If the plant looks healthy with no visible disease or pest damage, choose the "healthy_${crop}" option.
If you can see it's a plant but the photo is too blurry, dark, or zoomed out to judge confidently, respond with key "unclear".

Respond with ONLY a JSON object, no other text, in this exact format:
{"key": "the_matching_key", "confidence": 85, "reasoning": "one short sentence explaining what you see"}

confidence should be a number 0-100 reflecting how sure you are. Be honest and conservative — it is much better to say "unclear" than to guess.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
              ],
            },
          ],
          generationConfig: { temperature: 0.2 },
        }),
      },
    );

    if (!res.ok) {
      console.error("Gemini API error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    console.log("GEMINI RAW RESPONSE:", JSON.stringify(parsed));

    if (!parsed.key) return null;

    if (parsed.key === "unclear") {
      return {
        key: "unclear",
        confidence: 0,
        reasoning: String(parsed.reasoning || "Could not identify a plant in this image."),
      };
    }

    const match = pool.find((t) => t.key === parsed.key);
    if (!match) return null;

    return {
      key: parsed.key,
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 70)),
      reasoning: String(parsed.reasoning || ""),
    };
  } catch (err) {
    console.error("Gemini request failed", err);
    return null;
  }
}