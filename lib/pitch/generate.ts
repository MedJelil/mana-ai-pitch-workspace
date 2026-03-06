import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

export type ProductForPitch = {
  name: string;
  category: string;
  description: string;
  keySellingPoints: string[];
  certifications: string[];
  velocityData: string | null;
  packagingSustainability: string | null;
  pricePositioning: string | null;
};

export type GeneratedPitch = {
  positioning: string;
  talkingPoints: string[];
  suggestedPitch: string;
  fitScore: number;
  issues: string[];
  suggestions: string[];
};

const PITCH_JSON_SCHEMA = `{
  "positioning": "string: 2-4 sentences on how the product fits this retailer",
  "talkingPoints": ["string: bullet points for the meeting"],
  "suggestedPitch": "string: short ready-to-send pitch paragraph",
  "fitScore": number 1-100,
  "issues": ["string: potential objections or gaps"],
  "suggestions": ["string: actionable recommendations"]
}`;

const PITCH_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    positioning: { type: "string", description: "2-4 sentences on how the product fits this retailer" },
    talkingPoints: {
      type: "array",
      items: { type: "string" },
      description: "Bullet points for the meeting",
    },
    suggestedPitch: { type: "string", description: "Short ready-to-send pitch paragraph" },
    fitScore: { type: "number", description: "Fit score 1-100" },
    issues: {
      type: "array",
      items: { type: "string" },
      description: "Potential objections or gaps",
    },
    suggestions: {
      type: "array",
      items: { type: "string" },
      description: "Actionable recommendations",
    },
  },
  required: ["positioning", "talkingPoints", "suggestedPitch", "fitScore", "issues", "suggestions"],
};

export async function generatePitchWithClaude(
  product: ProductForPitch,
  retailer: string,
  focus: string
): Promise<GeneratedPitch> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });
  const productContext = buildProductContext(product);

  const systemPrompt = `You are an expert B2B retail sales strategist for a natural/organic food brand (Mana Foods). Your task is to generate tailored retail pitches.

Output only valid JSON matching this shape (no markdown, no code fence):
${PITCH_JSON_SCHEMA}

Be specific to the product and retailer. Use the product's certifications, velocity data, and sustainability info when relevant. fitScore should reflect real fit (80+ strong, 50-79 moderate, below 50 challenges). Issues and suggestions should be actionable.`;

  const userPrompt = `Generate a pitch for this product to ${retailer}, emphasizing the retailer's focus: "${focus}".

${productContext}

Return only the JSON object, no other text.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text"
      ? response.content[0].text
      : "";
  const trimmed = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const parsed = JSON.parse(trimmed) as GeneratedPitch;

  if (
    typeof parsed.positioning !== "string" ||
    !Array.isArray(parsed.talkingPoints) ||
    typeof parsed.suggestedPitch !== "string" ||
    typeof parsed.fitScore !== "number" ||
    !Array.isArray(parsed.issues) ||
    !Array.isArray(parsed.suggestions)
  ) {
    throw new Error("Claude returned invalid pitch shape");
  }

  return {
    positioning: parsed.positioning,
    talkingPoints: parsed.talkingPoints,
    suggestedPitch: parsed.suggestedPitch,
    fitScore: Math.min(100, Math.max(0, Math.round(parsed.fitScore))),
    issues: parsed.issues,
    suggestions: parsed.suggestions,
  };
}

function buildProductContext(product: ProductForPitch): string {
  return [
    `Product: ${product.name}`,
    `Category: ${product.category}`,
    `Description: ${product.description}`,
    product.keySellingPoints.length
      ? `Key selling points: ${product.keySellingPoints.join("; ")}`
      : "",
    product.certifications.length
      ? `Certifications: ${product.certifications.join(", ")}`
      : "",
    product.velocityData ? `Velocity/data: ${product.velocityData}` : "",
    product.packagingSustainability
      ? `Packaging/sustainability: ${product.packagingSustainability}`
      : "",
    product.pricePositioning
      ? `Price positioning: ${product.pricePositioning}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generatePitchWithGemini(
  product: ProductForPitch,
  retailer: string,
  focus: string
): Promise<GeneratedPitch> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const productContext = buildProductContext(product);

  const systemPrompt = `You are an expert B2B retail sales strategist for a natural/organic food brand (Mana Foods). Your task is to generate tailored retail pitches.

Output only valid JSON matching this shape (no markdown, no code fence):
${PITCH_JSON_SCHEMA}

Be specific to the product and retailer. Use the product's certifications, velocity data, and sustainability info when relevant. fitScore should reflect real fit (80+ strong, 50-79 moderate, below 50 challenges). Issues and suggestions should be actionable.`;

  const userPrompt = `Generate a pitch for this product to ${retailer}, emphasizing the retailer's focus: "${focus}".

${productContext}

Return only the JSON object, no other text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: PITCH_RESPONSE_SCHEMA,
    },
  });

  const rawText = response.text ?? "";
  const text = typeof rawText === "string" ? rawText : String(rawText);
  const trimmed = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  let parsed: GeneratedPitch;
  try {
    parsed = JSON.parse(trimmed) as GeneratedPitch;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}") + 1;
    if (start >= 0 && end > start) {
      try {
        parsed = JSON.parse(trimmed.slice(start, end)) as GeneratedPitch;
      } catch {
        const preview = trimmed.slice(0, 300);
        throw new Error(`Gemini returned invalid JSON. Preview: ${preview}...`);
      }
    } else {
      const preview = trimmed.slice(0, 300) || "(empty response)";
      throw new Error(`Gemini returned invalid JSON (no object found). Preview: ${preview}`);
    }
  }

  if (
    typeof parsed.positioning !== "string" ||
    !Array.isArray(parsed.talkingPoints) ||
    typeof parsed.suggestedPitch !== "string" ||
    typeof parsed.fitScore !== "number" ||
    !Array.isArray(parsed.issues) ||
    !Array.isArray(parsed.suggestions)
  ) {
    throw new Error("Gemini returned invalid pitch shape");
  }

  return {
    positioning: parsed.positioning,
    talkingPoints: parsed.talkingPoints,
    suggestedPitch: parsed.suggestedPitch,
    fitScore: Math.min(100, Math.max(0, Math.round(parsed.fitScore))),
    issues: parsed.issues,
    suggestions: parsed.suggestions,
  };
}

/** Default provider is Gemini; set PITCH_PROVIDER=claude to use Claude */
export async function generatePitch(
  product: ProductForPitch,
  retailer: string,
  focus: string
): Promise<GeneratedPitch> {
  const provider = (process.env.PITCH_PROVIDER ?? "gemini").toLowerCase();
  if (provider === "claude") {
    return generatePitchWithClaude(product, retailer, focus);
  }
  return generatePitchWithGemini(product, retailer, focus);
}
