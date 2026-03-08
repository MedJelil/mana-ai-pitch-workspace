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

export type BuyerSimulation = {
  questions: string[];
  concerns: string[];
  suggestions: string[];
};

export type ReadinessStatus = "ok" | "warning" | "missing";

export type ReadinessItem = {
  label: string;
  status: ReadinessStatus;
  note: string;
};

export type GeneratedPitch = {
  positioning: string;
  talkingPoints: string[];
  suggestedPitch: string;
  readiness: ReadinessItem[];
  issues: string[];
  suggestions: string[];
  buyerSimulation: BuyerSimulation;
};

const PITCH_JSON_SCHEMA = `{
  "positioning": "string: 2-4 sentences on how the product fits this retailer",
  "talkingPoints": ["string: bullet points for the meeting"],
  "suggestedPitch": "string: short ready-to-send pitch paragraph",
  "readiness": [
    { "label": "Certifications", "status": "ok|warning|missing", "note": "string: one sentence" },
    { "label": "Price alignment", "status": "ok|warning|missing", "note": "string: one sentence" },
    { "label": "Category fit", "status": "ok|warning|missing", "note": "string: one sentence" },
    { "label": "Velocity / proof", "status": "ok|warning|missing", "note": "string: one sentence" },
    { "label": "Margin viability", "status": "ok|warning|missing", "note": "string: one sentence" },
    { "label": "Packaging / format", "status": "ok|warning|missing", "note": "string: one sentence" }
  ],
  "issues": ["string: potential objections or gaps"],
  "suggestions": ["string: actionable recommendations"],
  "buyerSimulation": {
    "questions": ["string: questions the buyer would ask during the meeting"],
    "concerns": ["string: risks or red flags the buyer would flag internally"],
    "suggestions": ["string: what would make this pitch more likely to get a yes"]
  }
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
    readiness: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          status: { type: "string", enum: ["ok", "warning", "missing"] },
          note: { type: "string" },
        },
        required: ["label", "status", "note"],
      },
      description: "6 readiness dimensions evaluated against this specific retailer",
    },
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
    buyerSimulation: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: { type: "string" },
          description: "Questions the buyer would ask during the meeting",
        },
        concerns: {
          type: "array",
          items: { type: "string" },
          description: "Risks or red flags the buyer would flag internally",
        },
        suggestions: {
          type: "array",
          items: { type: "string" },
          description: "Changes that would make this pitch more likely to get a yes",
        },
      },
      required: ["questions", "concerns", "suggestions"],
    },
  },
  required: ["positioning", "talkingPoints", "suggestedPitch", "readiness", "issues", "suggestions", "buyerSimulation"],
};

export async function generatePitchWithClaude(
  product: ProductForPitch,
  retailer: string,
  focus: string,
  storeContext?: string
): Promise<GeneratedPitch> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });
  const productContext = buildProductContext(product);
  const retailerDNA = buildRetailerDNA(retailer);

  const systemPrompt = `You are an expert B2B retail sales strategist specialising in natural, organic, and specialty food brands. Your task is to generate a highly tailored retail pitch AND simulate how a buyer at that retailer would react to it.

Output only valid JSON matching this shape (no markdown, no code fence):
${PITCH_JSON_SCHEMA}

Pitch fields:
- Be specific to the product AND the retailer chain. Use the product's certifications, velocity data, price positioning, and sustainability info when relevant.
- Issues and suggestions must be actionable and retailer-specific.

readiness — evaluate exactly these 6 dimensions in order, using the product data and retailer context:
1. Certifications: does the product hold the certifications this retailer values most (organic, non-GMO, etc.)?
2. Price alignment: does the MSRP fit this retailer's typical shelf price tier for this category?
3. Category fit: is this category growing or well-established at this retailer?
4. Velocity / proof: does the brand have scan data, velocity numbers, or social proof to support claims?
5. Margin viability: can the product support this retailer's expected margin requirements?
6. Packaging / format: is the unit size and case pack appropriate for this retail channel?
Use "ok" when strong, "warning" when there's a potential concern, "missing" when it's a likely blocker.

buyerSimulation fields — think from the buyer's perspective, not the brand's:
- questions: 3 questions a real buyer at this retailer would ask in the meeting
- concerns: 2 internal red flags or risks the buyer would flag after the meeting
- suggestions: 3 specific changes that would make this pitch more likely to get a yes`;

  const targetDescription = storeContext ?? retailer;
  const userPrompt = `Generate a retail pitch for the product below, targeting ${targetDescription}.
Retailer brand: ${retailer}
Pitch focus / angle: ${focus}
${retailerDNA ? `\nRetailer context:\n${retailerDNA}` : ""}

${productContext}

Return only the JSON object, no other text.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
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
    !Array.isArray(parsed.readiness) ||
    !Array.isArray(parsed.issues) ||
    !Array.isArray(parsed.suggestions) ||
    !parsed.buyerSimulation ||
    !Array.isArray(parsed.buyerSimulation.questions) ||
    !Array.isArray(parsed.buyerSimulation.concerns) ||
    !Array.isArray(parsed.buyerSimulation.suggestions)
  ) {
    throw new Error("Claude returned invalid pitch shape");
  }

  return {
    positioning: parsed.positioning,
    talkingPoints: parsed.talkingPoints,
    suggestedPitch: parsed.suggestedPitch,
    readiness: parsed.readiness,
    issues: parsed.issues,
    suggestions: parsed.suggestions,
    buyerSimulation: parsed.buyerSimulation,
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
    product.velocityData ? `Velocity/sales data: ${product.velocityData}` : "",
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

type RetailerProfile = {
  summary: string;
  whatTheyValue: string[];
  marginExpectations: string;
  entryPath: string;
  typicalBuyerObjections: string[];
  dealBreakers: string[];
  whatMakesPitchStandOut: string;
};

function formatRetailerProfile(p: RetailerProfile): string {
  return [
    `Summary: ${p.summary}`,
    `What they value: ${p.whatTheyValue.join("; ")}`,
    `Margin expectations: ${p.marginExpectations}`,
    `Entry path: ${p.entryPath}`,
    `Typical buyer objections to pre-empt: ${p.typicalBuyerObjections.join("; ")}`,
    `Deal-breakers: ${p.dealBreakers.join("; ")}`,
    `What makes a pitch stand out: ${p.whatMakesPitchStandOut}`,
  ].join("\n");
}

/**
 * Returns a structured briefing on what the retailer chain cares about.
 * Covers values, margin expectations, entry path, typical objections, and deal-breakers
 * so the AI can tailor every section of the pitch accordingly.
 */
function buildRetailerDNA(retailer: string): string {
  const r = retailer.toLowerCase();

  if (r.includes("whole foods")) {
    return formatRetailerProfile({
      summary: "Premium natural/organic supermarket chain owned by Amazon. Skews toward affluent, health-conscious, sustainability-aware consumers.",
      whatTheyValue: [
        "USDA Organic, Non-GMO Project, and clean-label certifications",
        "Unique brand story and mission-driven positioning",
        "Velocity proof from independent natural retailers or co-ops",
        "Sustainable packaging and supply-chain transparency",
        "Local/regional sourcing wherever possible",
        "Category innovation — filling a gap in the current assortment",
      ],
      marginExpectations: "Typically expects 35–45% gross margin (cost-of-goods to shelf price). Buyers will pressure on cost; be prepared to show landed cost breakdown.",
      entryPath: "Local/regional buyer first (easier entry), then scale to national. Brokers (UNFI, KeHE) are often required for distribution. Local Forager program and Supplier Summit events are good entry points for emerging brands.",
      typicalBuyerObjections: [
        "Not enough velocity data from existing accounts",
        "Packaging doesn't meet Whole Foods quality visual standards",
        "Price point too high even for WFM shoppers",
        "Ingredient or certification gaps (e.g. missing Non-GMO)",
        "Can't support regional demo / marketing requirements",
      ],
      dealBreakers: [
        "Artificial colors, flavors, sweeteners, or preservatives",
        "Hydrogenated fats or high-fructose corn syrup",
        "Unverified health claims on packaging",
        "Unable to meet Whole Foods supplier standards audit",
      ],
      whatMakesPitchStandOut: "Lead with a tight brand story, show 3rd-party certifications prominently, present velocity benchmarks ($ per linear foot/week vs. category average), and articulate exactly which gap in their current set this fills.",
    });
  }

  if (r.includes("walmart") && !r.includes("sam")) {
    return formatRetailerProfile({
      summary: "World's largest retailer. Everyday-low-price (EDLP) model targeting value-seeking mass-market consumers. Requires massive scale.",
      whatTheyValue: [
        "Competitive everyday retail price — price must be the lowest or near-lowest in market",
        "Mass consumer appeal across income levels",
        "National or near-national distribution capability",
        "Supply-chain reliability — zero out-of-stocks tolerated",
        "Clear, simple product story that resonates in seconds",
        "IRI/Nielsen velocity data showing category pull",
      ],
      marginExpectations: "Expects ~25–35% gross margin. Walmart negotiates hard on cost and often demands cost reductions year-over-year. Build pricing model with room to give.",
      entryPath: "Walmart Open Call event (annual) is the primary entry path for small/emerging brands. Brokers with Walmart relationships (Acosta, Advantage) strongly recommended. Market Entry Program for smaller brands. Expect a 12–18 month sales cycle.",
      typicalBuyerObjections: [
        "Price point is too high for Walmart shopper",
        "Can't guarantee supply at volume (500+ stores)",
        "No existing mass-market velocity proof",
        "Packaging too premium/niche — won't resonate with core Walmart shopper",
        "No promotional budget for rollback pricing",
      ],
      dealBreakers: [
        "Cannot meet minimum supply volumes",
        "Retail price above mass-market ceiling for the category",
        "No UPC / proper labeling compliance",
        "Inability to support mandatory promotional funding (rollbacks)",
      ],
      whatMakesPitchStandOut: "Lead with the price-per-unit value story, show IRI/Nielsen category growth data, demonstrate supply-chain capacity with specifics (co-packer, warehouse locations), and present a clear promotional calendar with funding.",
    });
  }

  if (r.includes("heb") || r.includes("h-e-b")) {
    return formatRetailerProfile({
      summary: "Texas-based private supermarket chain, fiercely loyal to Texas consumers and local brands. One of the most respected regional retailers in the US.",
      whatTheyValue: [
        "Texas roots — local sourcing, Texas-made credentials, regional story",
        "Community ties and authentic Texas brand identity",
        "Fresh, quality products at fair value",
        "Strong consumer demand demonstrated in Texas markets",
        "Innovation that fits Texas consumer tastes (bold flavors, BBQ, Tex-Mex, health trends)",
        "Reliability and partnership mentality — they're highly loyal to good vendor partners",
      ],
      marginExpectations: "Standard supermarket margins ~30–40%. HEB values fair pricing and long-term partnership over extreme margin extraction.",
      entryPath: "Quest for Texas Best competition is the gold-standard entry path for Texas-based brands. ECRM events and direct outreach to category buyers also work. HEB prefers direct vendor relationships — less broker-dependent than national chains.",
      typicalBuyerObjections: [
        "Brand isn't Texas-based or doesn't have a Texas story",
        "No demonstrated Texas consumer demand",
        "Price doesn't fit HEB's value-oriented positioning",
        "Category is already well-served in their set",
        "Brand too small to support HEB's distribution network",
      ],
      dealBreakers: [
        "No Texas connection whatsoever — perceived as an out-of-state brand forcing entry",
        "Unable to support Texas-wide distribution",
        "Pricing significantly above HEB's value threshold for the category",
      ],
      whatMakesPitchStandOut: "Lead with the Texas angle hard — where it's made, where ingredients are sourced, Texas consumer traction. Show any local press, social following, or farmers market velocity. Frame it as a Texas brand for Texas consumers.",
    });
  }

  if (r.includes("sam's club")) {
    return formatRetailerProfile({
      summary: "Walmart-owned membership warehouse club. Serves small businesses and budget-conscious families. Club format means bulk packaging and strong value proposition.",
      whatTheyValue: [
        "Compelling price/value ratio in bulk/club-size format",
        "Proven national brand recognition or strong emerging brand with mass appeal",
        "Club-exclusive packaging (larger sizes, multi-packs — not standard retail SKUs)",
        "Supply reliability at high volume",
        "Member ROI — member must feel they're getting exceptional value",
      ],
      marginExpectations: "Margins typically 14–20%, lower than conventional grocery, but compensated by high volume. Cost efficiency is the primary lever.",
      entryPath: "Member's Mark private label is Sam's Club's preferred vehicle. Branded products need strong velocity proof and must justify club-format exclusivity. Sam's Club Member's Mark Supplier program and Sam's Club Open Call are entry points.",
      typicalBuyerObjections: [
        "No club-size SKU — standard retail sizes don't fit the warehouse model",
        "Price per unit not compelling enough to justify membership purchase",
        "Brand not well-known enough to drive member trial on a large club pack",
        "Supply chain can't support club distribution volumes",
      ],
      dealBreakers: [
        "Retail-sized packaging — must be in club format",
        "Margins too thin to offset club model's cost structure",
        "Brand with no mass awareness trying to drive trial in a club environment",
      ],
      whatMakesPitchStandOut: "Show exactly what the club pack would look like (size, count, price per unit vs. competitor), demonstrate the member value math explicitly, and reference any warehouse club velocity from Costco or BJ's if available.",
    });
  }

  if (r.includes("costco")) {
    return formatRetailerProfile({
      summary: "Premier membership warehouse club. Affluent, brand-loyal member base. Sells a curated assortment of ~4,000 SKUs vs. 30,000+ in a typical supermarket. Getting in is hard; staying in requires sustained velocity.",
      whatTheyValue: [
        "Exceptional quality at a value price — the 'treasure hunt' experience",
        "Costco-exclusive packaging (larger sizes or multi-packs not sold elsewhere)",
        "Broad appeal to their affluent, educated member demographic",
        "Proven category demand — Costco rarely takes risks on unknown products",
        "Consistent supply at massive volume (Costco can make or break a brand)",
        "Kirkland Signature private label partnership potential for established brands",
      ],
      marginExpectations: "Costco caps supplier margins at 15% above cost and keeps its own markup to ~14%. Supplier must be profitable at a lean margin — volume is the trade-off.",
      entryPath: "Almost exclusively through existing Costco buyer relationships or a warm introduction. Costco does not accept cold pitches. A food broker or existing Costco supplier acting as a reference is usually required. Regional buyers (e.g. Northwest, Southeast) are sometimes more accessible than national buyers.",
      typicalBuyerObjections: [
        "Not enough brand awareness for members to buy a large club pack on first sight",
        "Can't supply at Costco's volume requirements",
        "Price after Costco markup won't deliver strong enough member value",
        "Product doesn't have broad-enough appeal for Costco's wide member base",
        "Not differentiated enough from existing Costco assortment",
      ],
      dealBreakers: [
        "Selling the same product at a lower unit price elsewhere — Costco requires price exclusivity",
        "Inability to meet supply volumes (Costco will drop a vendor mid-season for stock-outs)",
        "Product or brand with any quality controversy",
      ],
      whatMakesPitchStandOut: "Show strong brand awareness metrics, propose a Costco-exclusive pack with compelling per-unit value math, reference comparable products Costco already sells to validate the category, and demonstrate supply-chain depth.",
    });
  }

  if (r.includes("kroger")) {
    return formatRetailerProfile({
      summary: "Largest US supermarket chain by revenue. Data-driven, metrics-obsessed buying process. Operates under 20+ banner names (Ralphs, Fred Meyer, Harris Teeter, etc.).",
      whatTheyValue: [
        "IRI/Nielsen velocity benchmarks vs. category average",
        "Category incremental value — must show how it grows the category, not just cannibalize",
        "Competitive margin contribution",
        "Shopper marketing funding and promotional calendar commitment",
        "Simple Kroger / Our Brands private-label differentiation story",
        "Compliance with Kroger's supplier standards and EDI requirements",
      ],
      marginExpectations: "Expects 35–45% gross margin. Slotting fees common for new items. Promotional funding (MCBs, scan-backs) expected as part of the partnership.",
      entryPath: "Kroger's supplier portal (Supplier Hub) is the starting point. Category management presentations at their Cincinnati HQ are standard. KeHE and UNFI distribute to Kroger's natural/specialty sections. Kroger's Go Fresh & Local supplier accelerator targets regional brands.",
      typicalBuyerObjections: [
        "Velocity data not benchmarked against IRI/Nielsen — 'show me the numbers'",
        "No commitment to promotional funding (scan-backs, TPRs, MCBs)",
        "Can't scale to all Kroger banners — need to prove regional traction first",
        "Simple Kroger or Our Brands could do this at lower cost",
        "No shopper marketing support to drive trial",
      ],
      dealBreakers: [
        "No IRI/Nielsen or SPINS velocity data at all",
        "Unwilling to commit to slotting and promotional funding",
        "Unable to meet Kroger's EDI and compliance requirements",
      ],
      whatMakesPitchStandOut: "Lead with the SPINS/IRI data package, present a clear category management story (who the target shopper is, how this fills a gap), show a detailed promotional calendar with funding commitments, and reference other Kroger-banner performance if available.",
    });
  }

  if (r.includes("target")) {
    return formatRetailerProfile({
      summary: "Mass-market retailer with a design-forward, trend-conscious brand identity. Core shoppers are millennials and Gen-Z, skewing female. Food is a growing category for Target.",
      whatTheyValue: [
        "Trend-forward, aesthetically pleasing packaging — 'Instagrammable' shelf presence",
        "Better-for-you or sustainability story that resonates with millennial/Gen-Z values",
        "Strong social media presence and organic consumer demand",
        "Clear differentiation from Target's own Good & Gather private label",
        "Accessible price point — Target shopper is value-conscious despite aspirational tastes",
        "Omnichannel potential — products that work well for Target.com and same-day delivery",
      ],
      marginExpectations: "Expects ~35–45% margin. Target also requires vendor compliance costs (labeling, EDI, fulfillment standards) which eat into margin.",
      entryPath: "Target Takeoff accelerator program for emerging brands. ECRM events. Brokers with Target relationships (Acosta, Daymon). Target's open submission portal for some categories. Local Target stores' regional buyers are harder to access than Kroger regional buyers.",
      typicalBuyerObjections: [
        "Packaging doesn't meet Target's visual/design bar",
        "Too similar to Good & Gather — Target prefers brands that don't directly compete with their private label",
        "Brand's social media presence is weak — Target shoppers discover via Instagram/TikTok",
        "Price point too high for Target's mass-market floor",
        "No proof of omnichannel (online) velocity",
      ],
      dealBreakers: [
        "Packaging that looks generic or dated",
        "Direct overlap with Good & Gather at a higher price",
        "No ability to support Target.com fulfillment requirements",
      ],
      whatMakesPitchStandOut: "Lead with brand visuals and social proof (follower counts, UGC, press), demonstrate the 'white space' in Target's existing assortment, show Target.com search volume or demand signals, and bring packaging samples that speak for themselves.",
    });
  }

  if (r.includes("sprouts")) {
    return formatRetailerProfile({
      summary: "Natural and organic specialty supermarket. Actively seeks out emerging, innovative brands — more approachable for smaller brands than Whole Foods.",
      whatTheyValue: [
        "Clean, minimal ingredient lists — no artificial anything",
        "Organic, Non-GMO, or other natural certifications",
        "Category innovation and trending health/wellness ingredients",
        "Competitive pricing within the natural channel",
        "Brands with grassroots community or natural-channel velocity",
        "Unique differentiation — they love discovering brands before they're mainstream",
      ],
      marginExpectations: "Expects ~35–42% margin. Less aggressive on cost than Whole Foods, but still needs healthy category contribution.",
      entryPath: "Sprouts Farmers Market Supplier Portal (direct application). Sprouts Buys Local program for regional brands. ECRM Healthy, Natural & Organic events. KeHE and UNFI are Sprouts' primary distributors.",
      typicalBuyerObjections: [
        "Ingredient list has anything artificial or processed",
        "Price point too high even for natural-channel shoppers",
        "Category is already saturated in their set",
        "No velocity data from comparable natural-channel retailers",
      ],
      dealBreakers: [
        "Any artificial colors, flavors, sweeteners, or preservatives",
        "Product that doesn't fit Sprouts' health-focused brand identity",
      ],
      whatMakesPitchStandOut: "Lead with the clean-label story and certifications, show natural-channel velocity (natural food stores, co-ops, Whole Foods if applicable), highlight any trending ingredient or health claim, and frame the brand as an 'emerging find' that Sprouts can champion.",
    });
  }

  if (r.includes("trader joe")) {
    return formatRetailerProfile({
      summary: "Cult-favorite specialty grocer. 100% private label — they do not sell national brands. All products are sold under Trader Joe's brand exclusively.",
      whatTheyValue: [
        "Unique, innovative formulations or flavor profiles not available elsewhere",
        "High quality at an accessible price — the core TJ's value proposition",
        "Products that create the 'treasure hunt' discovery experience",
        "Broad consumer appeal — TJ's shoppers are adventurous but value-focused",
        "Ability to manufacture the product under the Trader Joe's brand exclusively",
        "Clean-ish ingredients — TJ's has moved toward cleaner labels but isn't as strict as WFM",
      ],
      marginExpectations: "Trader Joe's sets the price and the margin — suppliers sell cost-plus to TJ's, who then brand and price the product. Margins for suppliers are typically thin but volume is high.",
      entryPath: "Trader Joe's does not accept standard vendor pitches through normal channels. Contact is exclusively through their Monrovia, CA headquarters. A warm introduction through an existing TJ's supplier is the most reliable path. They initiate many of their own product searches.",
      typicalBuyerObjections: [
        "Product is already sold under another brand — TJ's won't take a re-branded existing SKU",
        "Formulation not unique enough to justify a Trader Joe's exclusive",
        "Manufacturer can't produce at TJ's required volume",
        "Price after TJ's branding doesn't create enough perceived value vs. their existing assortment",
      ],
      dealBreakers: [
        "Brand insists on selling under its own name — TJ's is private-label only",
        "Product is a commodity with no differentiation",
        "Manufacturer lacks capacity for TJ's volume requirements",
      ],
      whatMakesPitchStandOut: "Frame the product explicitly as a Trader Joe's exclusive concept, not a re-brand of an existing product. Lead with the unique formulation or flavor angle, show cost-to-produce that supports TJ's pricing model, and present it as something their shoppers will talk about.",
    });
  }

  if (r.includes("publix")) {
    return formatRetailerProfile({
      summary: "Dominant Southeast US supermarket chain with a reputation for quality and customer service. Operates in FL, GA, AL, SC, NC, TN, VA.",
      whatTheyValue: [
        "Reliable supply and operational excellence — Publix has very low tolerance for out-of-stocks",
        "Strong Southeast regional consumer demand",
        "Products that complement or differentiate from Publix Private Selection and GreenWise lines",
        "Clean, professional packaging that meets Publix's high aesthetic standards",
        "Competitive pricing appropriate to the Southeast market",
        "Long-term vendor partnership mentality",
      ],
      marginExpectations: "Expects ~35–42% margin. Promotional funding (feature ads, TPRs) is expected as part of the partnership.",
      entryPath: "Publix does not accept unsolicited vendor pitches — they work through a formal supplier diversity and vendor portal. Brokers with established Publix relationships (Acosta, Advantage) are almost required. Category presentations at their Lakeland, FL HQ.",
      typicalBuyerObjections: [
        "No demonstrated Southeast market traction",
        "Supply chain can't reliably serve Publix's Southeast distribution network",
        "Too similar to existing Publix Private Selection or GreenWise products",
        "Packaging doesn't meet Publix's strict quality presentation standards",
      ],
      dealBreakers: [
        "No presence or consumer demand in the Southeast",
        "Repeated supply issues or out-of-stocks — Publix drops vendors quickly for reliability failures",
        "Cannot meet Publix's EDI and vendor compliance requirements",
      ],
      whatMakesPitchStandOut: "Show Southeast-specific consumer demand data, reference any Florida/Georgia market velocity, demonstrate supply-chain reliability with specifics, and show how the product complements (not competes with) their GreenWise natural line.",
    });
  }

  if (r.includes("aldi")) {
    return formatRetailerProfile({
      summary: "Hard-discount grocery chain. Exclusively private-label model. Extremely cost-efficient, limited SKU assortment (~1,800 SKUs vs. 30,000 at a traditional supermarket).",
      whatTheyValue: [
        "Lowest possible cost of goods — ALDI's model only works at extreme cost efficiency",
        "Ability to produce under the ALDI private label exclusively",
        "Simple, clean formulations that don't require complex ingredients",
        "Consistent quality that meets ALDI's surprisingly high taste standards",
        "High-volume production capability",
        "Packaging that is functional and cost-efficient (no premium materials)",
      ],
      marginExpectations: "ALDI operates on very thin supplier margins — suppliers sell cost-plus to ALDI at extremely competitive rates. Volume compensates for low per-unit margin.",
      entryPath: "ALDI works through a formal supplier portal and tender process. They run category tenders periodically and select suppliers through a competitive bid. A broker with ALDI relationships is helpful but not always required.",
      typicalBuyerObjections: [
        "Cost of goods too high for ALDI's price model",
        "Manufacturer unwilling to produce as an ALDI exclusive",
        "Production complexity adds cost that ALDI's model can't absorb",
        "Brand insists on selling under its own name",
      ],
      dealBreakers: [
        "Insisting on branded (non-private label) placement",
        "Cost-of-goods that make ALDI's retail price non-competitive",
        "Insufficient production volume capacity",
      ],
      whatMakesPitchStandOut: "Lead with a detailed cost-of-goods breakdown that shows ALDI's retail price will be at least 20–30% below comparable national brands. Show production capacity and reliability. Frame the product as an ALDI exclusive concept.",
    });
  }

  if (r.includes("safeway") || r.includes("albertsons") || r.includes("vons") || r.includes("jewel")) {
    return formatRetailerProfile({
      summary: "Albertsons Companies is the second-largest US supermarket group, operating under Safeway, Albertsons, Vons, Jewel-Osco, Shaw's, and other banners.",
      whatTheyValue: [
        "IRI/Nielsen velocity data benchmarked against category",
        "Promotional funding commitment (TPRs, feature ads, digital coupons)",
        "Differentiation from their O Organics and Signature SELECT private labels",
        "Regional consumer demand data for the specific banner",
        "Reliable supply and EDI compliance",
        "Loyalty program integration potential (for Safeway Just for U program)",
      ],
      marginExpectations: "Expects ~35–45% margin plus promotional funding. Slotting fees are common. Budget for MCBs (manufacturer chargebacks) and scan-backs.",
      entryPath: "Albertsons Companies supplier portal. Category presentations at their Boise, ID headquarters. Regional buyer access varies by banner. KeHE and UNFI distribute to their natural/specialty sections.",
      typicalBuyerObjections: [
        "Velocity data not strong enough to justify shelf space",
        "No promotional funding budget",
        "Too similar to O Organics private label at a higher price",
        "Regional distribution can't support all Albertsons banners",
      ],
      dealBreakers: [
        "No willingness to fund promotions",
        "Direct competition with O Organics at a higher price with no clear differentiation",
        "Supply chain failures — Albertsons is strict on out-of-stocks",
      ],
      whatMakesPitchStandOut: "Lead with the SPINS/IRI data story, present a 12-month promotional calendar with funding, show how the product is differentiated from their strong private label lineup, and offer banner-specific marketing support.",
    });
  }

  if (r.includes("wegmans")) {
    return formatRetailerProfile({
      summary: "Premium Northeast/Mid-Atlantic supermarket chain with a cult following. Known for exceptional store experience, culinary expertise, and high quality standards.",
      whatTheyValue: [
        "Exceptional quality — Wegmans has the highest quality bar of any conventional grocer",
        "Culinary authenticity and storytelling — the 'chef-approved' angle resonates",
        "Local and regional sourcing — strong preference for Northeast producers",
        "Innovation in the food experience — products that excite home cooks",
        "Clean labels and natural ingredients without being exclusively natural-channel",
        "Long-term vendor partnership — Wegmans is very loyal to great suppliers",
      ],
      marginExpectations: "Expects 35–45% margin. Less focused on promotional funding than Kroger or Albertsons — quality and story matter more.",
      entryPath: "Wegmans has a reputation for being very hard to get into without a relationship. Direct outreach to category buyers at their Rochester, NY HQ. Wegmans Food You Feel Good About program for natural/clean products. Local vendor events in their markets.",
      typicalBuyerObjections: [
        "Quality or ingredient story doesn't meet Wegmans' elevated bar",
        "Too mainstream or mass-market — Wegmans buyers gravitate toward specialty and unique",
        "No regional (Northeast) production or sourcing story",
        "Distribution can't serve Wegmans' tightly managed supply chain",
      ],
      dealBreakers: [
        "Quality that falls below Wegmans' standards — they will pull products quickly",
        "Generic, commoditized positioning without a compelling culinary story",
      ],
      whatMakesPitchStandOut: "Lead with the culinary story and quality credentials, emphasize any local/Northeast connection, bring samples (Wegmans buyers respond strongly to taste), and show how the product fits their food-culture brand identity.",
    });
  }

  if (r.includes("fresh market")) {
    return formatRetailerProfile({
      summary: "Specialty grocery chain focused on fresh, premium, and specialty foods. Smaller store format (~20,000 sq ft) with a curated, boutique feel.",
      whatTheyValue: [
        "Premium quality and specialty positioning",
        "Unique, discovery-worthy products not available in conventional grocery",
        "Strong brand story and artisan or craft credentials",
        "Clean ingredients and natural/organic options",
        "Products that complement their specialty cheese, charcuterie, and gourmet sections",
      ],
      marginExpectations: "Expects ~40–48% gross margin — one of the higher margin expectations due to smaller volume.",
      entryPath: "The Fresh Market vendor portal and direct buyer outreach to their Greensboro, NC HQ. ECRM Specialty Food events are effective. They work with specialty food distributors (DPI, specialty KeHE).",
      typicalBuyerObjections: [
        "Product not premium or unique enough for a specialty grocer",
        "Price too high even for their premium-leaning shopper base",
        "Brand too widely distributed — Fresh Market prefers some exclusivity",
      ],
      dealBreakers: [
        "Commodity or highly mainstream products",
        "Mass-market distribution that removes the 'discovery' aspect",
      ],
      whatMakesPitchStandOut: "Lead with the artisan/craft story, premium ingredients, and uniqueness. Show that the product isn't available in every grocery store — scarcity and discovery are core to The Fresh Market's identity.",
    });
  }

  if (r.includes("natural grocers") || r.includes("vitamin cottage")) {
    return formatRetailerProfile({
      summary: "Colorado-based natural and organic grocery chain. Among the strictest ingredient standards of any retailer — more restrictive than Whole Foods.",
      whatTheyValue: [
        "The strictest clean-label standards in retail — 'always organic' in produce, no artificial anything",
        "Products that meet their rigorous Quality Standards (stricter than USDA Organic in many cases)",
        "Affordable pricing — Natural Grocers is unique in combining strict natural standards with value pricing",
        "Educating shoppers — brands with a strong educational health story resonate",
        "Local and regional sourcing in Mountain/Plains/Pacific Northwest markets",
      ],
      marginExpectations: "Expects ~35–40% margin. They are unique in not charging slotting fees, which makes them accessible for smaller brands.",
      entryPath: "Natural Grocers does not charge slotting fees — a major advantage. Direct submission through their vendor portal. They often discover brands at regional natural food trade shows (Expo West, Expo East).",
      typicalBuyerObjections: [
        "Product doesn't meet their Quality Standards (which go beyond USDA Organic)",
        "Price point too high for Natural Grocers' value-oriented natural shopper",
        "No traction in the Mountain West or Pacific Northwest markets",
      ],
      dealBreakers: [
        "Any ingredient on Natural Grocers' prohibited list — they publish a strict Quality Standards list",
        "Conventional (non-organic) produce ingredients in a product claiming to be natural",
      ],
      whatMakesPitchStandOut: "Show that you've reviewed their Quality Standards and your product meets or exceeds them. Lead with the educational health story. Emphasize the accessible price point and value-for-organic positioning.",
    });
  }

  if (r.includes("bj's")) {
    return formatRetailerProfile({
      summary: "Membership warehouse club operating in the Northeast US. Similar model to Costco but with a more coupon-friendly, value-deal-oriented member base.",
      whatTheyValue: [
        "Strong price/value ratio in club-size packaging",
        "Northeast US consumer relevance",
        "Brand recognition — BJ's members are deal-savvy and brand-conscious",
        "Club-exclusive packaging (multi-packs, larger sizes)",
        "Promotional deal structures (BJ's members are highly coupon and deal responsive)",
      ],
      marginExpectations: "Similar to Costco — thin margins (~14–18%) offset by volume. BJ's members are more price-sensitive than Costco members.",
      entryPath: "BJ's Wholesale Club vendor portal. Less difficult to enter than Costco — BJ's is more open to branded products and less exclusively tied to private label.",
      typicalBuyerObjections: [
        "No club-size packaging available",
        "Brand not well enough known in the Northeast",
        "Price per unit not competitive enough for BJ's deal-focused members",
      ],
      dealBreakers: [
        "Standard retail packaging — must be club format",
        "Northeast distribution and supply chain can't support BJ's network",
      ],
      whatMakesPitchStandOut: "Show the per-unit value calculation vs. retail grocery, demonstrate Northeast market demand, and propose a BJ's-exclusive bundle or multi-pack that creates a compelling deal narrative.",
    });
  }

  if (r.includes("amazon") || r.includes("amazon fresh")) {
    return formatRetailerProfile({
      summary: "Amazon's online grocery platform plus Amazon Fresh physical stores. Data-driven to an extreme — every decision is based on search, conversion, and review data.",
      whatTheyValue: [
        "Strong Amazon search demand signals (keyword volume for the category)",
        "High review count and rating (4+ stars) on Amazon marketplace",
        "Products optimized for e-commerce (packaging that ships well, clear product titles/bullets)",
        "Subscribe & Save eligible products — recurring purchase potential",
        "Prime-eligible fulfillment capability",
        "Category where online grocery ordering is growing",
      ],
      marginExpectations: "Amazon Fresh/Vendor Central: ~30–40% margin. Amazon Marketplace (3P): seller sets price but Amazon takes 15–20% referral fee. Account for FBA fees if using fulfillment by Amazon.",
      entryPath: "Amazon Vendor Central invitation (1P) or Amazon Seller Central self-service (3P). Whole Foods Market (Amazon-owned) is a separate buyer relationship. Amazon Fresh in-store requires Amazon Fresh buyer contact.",
      typicalBuyerObjections: [
        "No Amazon listing or review history",
        "Product not optimized for e-commerce (fragile packaging, poor search title)",
        "Low category search volume online",
        "Competing effectively on price vs. established Amazon sellers",
      ],
      dealBreakers: [
        "Packaging not e-commerce safe (breakage in shipping)",
        "No ability to fulfill FBA requirements",
      ],
      whatMakesPitchStandOut: "Lead with Amazon search volume data for the category, show existing Amazon reviews/rating if listed, demonstrate e-commerce optimized packaging, and present a Subscribe & Save strategy that drives LTV.",
    });
  }

  // Generic grocery retailer — provide general buyer context
  return formatRetailerProfile({
    summary: "Retail grocery buyer. Focus on driving category sales, managing shelf space efficiently, and building a profitable, reliable vendor portfolio.",
    whatTheyValue: [
      "Demonstrated consumer demand — velocity data from existing accounts",
      "Clear category incrementality — how does this grow the category vs. cannibalizing existing SKUs",
      "Reliable supply chain with no out-of-stocks",
      "Competitive margin contribution",
      "Promotional support and marketing investment",
      "Clean, professional packaging and branding",
    ],
    marginExpectations: "Typical grocery retail margin expectation is 30–45% gross margin. Be prepared to show your cost-of-goods and explain your price architecture.",
    entryPath: "Direct outreach to category buyer, ECRM events, food industry trade shows (Expo West, Fancy Food Show), and food brokers with established retailer relationships.",
    typicalBuyerObjections: [
      "Not enough velocity proof from existing accounts",
      "Price point doesn't fit the retailer's consumer demographic",
      "Too similar to existing assortment — what's the incremental value?",
      "Supply chain can't support the retailer's volume or distribution requirements",
      "No promotional funding available",
    ],
    dealBreakers: [
      "No sales data whatsoever — buyers need some proof of consumer pull",
      "Inability to meet the retailer's distribution and compliance requirements",
    ],
    whatMakesPitchStandOut: "Lead with velocity data and the category white-space story. Show exactly which SKUs you would displace and why yours is a net gain for the category. Bring a clear first-year promotional plan with funding committed.",
  });
}

export async function generatePitchWithGemini(
  product: ProductForPitch,
  retailer: string,
  focus: string,
  storeContext?: string
): Promise<GeneratedPitch> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const productContext = buildProductContext(product);
  const retailerDNA = buildRetailerDNA(retailer);

  const systemPrompt = `You are an expert B2B retail sales strategist specialising in natural, organic, and specialty food brands. Your task is to generate a highly tailored retail pitch AND simulate how a buyer at that retailer would react to it.

Output only valid JSON matching this shape (no markdown, no code fence):
${PITCH_JSON_SCHEMA}

Pitch fields:
- Be specific to the product AND the retailer chain. Use the product's certifications, velocity data, price positioning, and sustainability info when relevant.
- Issues and suggestions must be actionable and retailer-specific.

readiness — evaluate exactly these 6 dimensions in order, using the product data and retailer context:
1. Certifications: does the product hold the certifications this retailer values most (organic, non-GMO, etc.)?
2. Price alignment: does the MSRP fit this retailer's typical shelf price tier for this category?
3. Category fit: is this category growing or well-established at this retailer?
4. Velocity / proof: does the brand have scan data, velocity numbers, or social proof to support claims?
5. Margin viability: can the product support this retailer's expected margin requirements?
6. Packaging / format: is the unit size and case pack appropriate for this retail channel?
Use "ok" when strong, "warning" when there's a potential concern, "missing" when it's a likely blocker.

buyerSimulation fields — think from the buyer's perspective, not the brand's:
- questions: 3 questions a real buyer at this retailer would ask in the meeting
- concerns: 2 internal red flags or risks the buyer would flag after the meeting
- suggestions: 3 specific changes that would make this pitch more likely to get a yes`;

  const targetDescription = storeContext ?? retailer;
  const userPrompt = `Generate a retail pitch for the product below, targeting ${targetDescription}.
Retailer brand: ${retailer}
Pitch focus / angle: ${focus}
${retailerDNA ? `\nRetailer context:\n${retailerDNA}` : ""}

${productContext}

Return only the JSON object, no other text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 8192,
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
    !Array.isArray(parsed.readiness) ||
    !Array.isArray(parsed.issues) ||
    !Array.isArray(parsed.suggestions) ||
    !parsed.buyerSimulation ||
    !Array.isArray(parsed.buyerSimulation.questions) ||
    !Array.isArray(parsed.buyerSimulation.concerns) ||
    !Array.isArray(parsed.buyerSimulation.suggestions)
  ) {
    throw new Error("Gemini returned invalid pitch shape");
  }

  return {
    positioning: parsed.positioning,
    talkingPoints: parsed.talkingPoints,
    suggestedPitch: parsed.suggestedPitch,
    readiness: parsed.readiness,
    issues: parsed.issues,
    suggestions: parsed.suggestions,
    buyerSimulation: parsed.buyerSimulation,
  };
}

/** Default provider is Gemini; set PITCH_PROVIDER=claude to use Claude */
export async function generatePitch(
  product: ProductForPitch,
  retailer: string,
  focus: string,
  storeContext?: string
): Promise<GeneratedPitch> {
  const provider = (process.env.PITCH_PROVIDER ?? "gemini").toLowerCase();
  if (provider === "claude") {
    return generatePitchWithClaude(product, retailer, focus, storeContext);
  }
  return generatePitchWithGemini(product, retailer, focus, storeContext);
}
