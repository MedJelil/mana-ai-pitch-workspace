import { GoogleGenAI } from "@google/genai";

export type ProductForSimulation = {
  name: string;
  category: string;
  description: string;
  keySellingPoints: string[];
  certifications: string[];
  velocityData: string | null;
  packagingSustainability: string | null;
  pricePositioning: string | null;
};

export type PitchForSimulation = {
  positioning: string;
  talkingPoints: string[];
  suggestedPitch: string;
};

export type BuyerSimulationResult = {
  questions: string[];
  concerns: string[];
  suggestions: string[];
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: { type: "string" },
      description: "Questions the buyer would ask the brand",
    },
    concerns: {
      type: "array",
      items: { type: "string" },
      description: "Potential risks or issues the buyer might notice",
    },
    suggestions: {
      type: "array",
      items: { type: "string" },
      description: "Recommendations to improve the pitch and increase acceptance",
    },
  },
  required: ["questions", "concerns", "suggestions"],
};

function buildProductContext(product: ProductForSimulation): string {
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

export async function simulateBuyerWithGemini(
  product: ProductForSimulation,
  retailer: string,
  pitch: PitchForSimulation
): Promise<BuyerSimulationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const productContext = buildProductContext(product);

  const systemPrompt = `Act as a grocery retail buyer for ${retailer}. Review this product pitch from a natural/organic food brand and respond as the buyer would.

Output only valid JSON with this shape (no markdown):
{
  "questions": ["string: questions you would ask the brand"],
  "concerns": ["string: potential risks or issues you notice"],
  "suggestions": ["string: how to improve the pitch to increase acceptance"]
}

Be realistic and specific. Ask questions a real buyer would ask. Surface concerns relevant to ${retailer}'s priorities. Give actionable suggestions.`;

  const userPrompt = `Product context:
${productContext}

Pitch positioning:
${pitch.positioning}

Talking points:
${pitch.talkingPoints.join("\n")}

Suggested pitch:
"${pitch.suggestedPitch}"

Provide 3 questions, 2 concerns, and 3 suggestions. Return only the JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const rawText = response.text ?? "";
  const text = typeof rawText === "string" ? rawText : String(rawText);
  const trimmed = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  let parsed: BuyerSimulationResult;
  try {
    parsed = JSON.parse(trimmed) as BuyerSimulationResult;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}") + 1;
    if (start >= 0 && end > start) {
      try {
        parsed = JSON.parse(trimmed.slice(start, end)) as BuyerSimulationResult;
      } catch {
        const preview = trimmed.slice(0, 300);
        throw new Error(`Simulation returned invalid JSON. Preview: ${preview}${trimmed.length > 300 ? "…" : ""}`);
      }
    } else {
      const preview = trimmed.slice(0, 300) || "(empty response)";
      throw new Error(`Simulation returned invalid JSON (no object found). Preview: ${preview}`);
    }
  }

  if (
    !Array.isArray(parsed.questions) ||
    !Array.isArray(parsed.concerns) ||
    !Array.isArray(parsed.suggestions)
  ) {
    throw new Error("Simulation returned invalid structure");
  }

  return {
    questions: parsed.questions.filter((q) => typeof q === "string"),
    concerns: parsed.concerns.filter((c) => typeof c === "string"),
    suggestions: parsed.suggestions.filter((s) => typeof s === "string"),
  };
}
