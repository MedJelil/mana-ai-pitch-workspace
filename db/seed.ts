import "dotenv/config";
import { db } from "./index";
import { user, product, pitch } from "./schema";
import { eq } from "drizzle-orm";
import type { BuyerSimulation, ReadinessItem } from "./schema/pitch";

const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL ?? "seed@mana.local";
const SEED_USER_NAME = "Mana Seed User";

const SEED_PRODUCTS = [
  {
    name: "Organic Açaí Bowl Mix",
    category: "Bowls",
    description:
      "Sustainably harvested açaí blend with banana and berries. Sourced from the Brazilian Amazon with zero artificial additives.",
    keySellingPoints: [
      "100% USDA Organic certified with transparent supply chain",
      "35% higher antioxidant content than leading competitors",
      "Shelf-stable format reduces shrink by 60% vs frozen alternatives",
    ],
    certifications: ["USDA Organic", "Non-GMO"],
    velocityData: "$42/linear foot/week in comparable natural retailers",
    packagingSustainability: "Carbon-neutral packaging, fully recyclable",
    pricePositioning: "Premium",
  },
  {
    name: "Cold-Pressed Green Juice",
    category: "Beverages",
    description:
      "Kale, spinach, cucumber, celery, and lemon. Cold-pressed to retain maximum nutrients.",
    keySellingPoints: [
      "No added sugar or preservatives",
      "24-hour shelf life, refrigerated",
      "Strong repeat purchase rate in premium grocers",
    ],
    certifications: ["USDA Organic", "Non-GMO", "Vegan"],
    velocityData: null,
    packagingSustainability: "Recyclable glass bottles",
    pricePositioning: "Premium",
  },
  {
    name: "Vegan Protein Bar",
    category: "Snacks",
    description:
      "Plant-based protein with dark chocolate and almonds. 15g protein per bar, no soy or gluten.",
    keySellingPoints: [
      "15g plant protein per bar",
      "No soy, gluten-free",
      "Top 3 velocity in natural channel protein bar category",
    ],
    certifications: ["Vegan", "Gluten-Free", "Non-GMO"],
    velocityData: "Top 3 velocity in natural channel protein bar category",
    packagingSustainability: "Recyclable wrapper, FSC-certified cardboard display",
    pricePositioning: "Mid-tier",
  },
  {
    name: "Coconut Water Blend",
    category: "Beverages",
    description:
      "Pure coconut water with pineapple and mango. Hydrating and naturally sweet, no added sugar.",
    keySellingPoints: [
      "No added sugar",
      "Electrolyte-rich for active lifestyles",
      "Proven performance in club and mass channels",
    ],
    certifications: ["Non-GMO"],
    velocityData: null,
    packagingSustainability: "BPA-free Tetra Pak, recyclable",
    pricePositioning: "Value",
  },
  {
    name: "Superfood Smoothie Pack",
    category: "Smoothies",
    description:
      "Pre-portioned smoothie packs with adaptogens. Ready to blend with water or milk.",
    keySellingPoints: [
      "Convenient single-serve format",
      "Includes ashwagandha and maca",
      "Strong growth in functional beverage category",
    ],
    certifications: ["USDA Organic", "Vegan"],
    velocityData: null,
    packagingSustainability: "Compostable sachets",
    pricePositioning: "Premium",
  },
  {
    name: "Hemp Seed Granola",
    category: "Snacks",
    description:
      "Crunchy granola with hemp seeds and honey. High in omega-3 and protein.",
    keySellingPoints: [
      "10g plant protein per serving",
      "Omega-3 from hemp seeds",
      "Clean ingredient list, no artificial flavors",
    ],
    certifications: ["Non-GMO"],
    velocityData: "$28/ft/week in natural breakfast aisle",
    packagingSustainability: "Recyclable bag, minimal packaging",
    pricePositioning: "Mid-tier",
  },
];

type SeedPitch = {
  retailer: string;
  retailerBrand: string;
  storeContext: string;
  focus: string;
  positioning: string;
  talkingPoints: string[];
  suggestedPitch: string;
  readiness: ReadinessItem[];
  issues: string[];
  suggestions: string[];
  buyerSimulation: BuyerSimulation;
};

const SEED_PITCHES: SeedPitch[] = [
  {
    retailer: "Whole Foods Market — Austin, TX",
    retailerBrand: "Whole Foods",
    storeContext: "Whole Foods Market in Austin, TX",
    focus: "Organic, Sustainable",
    positioning:
      "Mana's Organic Açaí Bowl Mix is a natural fit for Whole Foods' premium health-conscious lineup. Sustainably sourced from the Brazilian Amazon with zero artificial additives, it delivers best-in-class antioxidant density alongside carbon-neutral packaging — directly aligned with Whole Foods' Quality Standards and sustainability commitments.",
    talkingPoints: [
      "100% USDA Organic certified with fully transparent supply chain",
      "35% higher antioxidant content than leading competitors",
      "Shelf-stable format reduces shrink by 60% vs frozen alternatives",
      "Proven velocity: $42/linear foot/week in comparable natural retailers",
      "Carbon-neutral, recyclable packaging supports Whole Foods sustainability goals",
    ],
    suggestedPitch:
      "We'd love to bring Mana's Açaí Bowl Mix to your stores. With $42/ft/week velocity in natural channel and 100% USDA Organic certification, it's built for your health-conscious shoppers. Our carbon-neutral packaging aligns with your sustainability commitments. Can we schedule a category review?",
    readiness: [
      { label: "Certifications", status: "ok", note: "USDA Organic and Non-GMO — meets Whole Foods Quality Standards" },
      { label: "Price Alignment", status: "warning", note: "Price point is ~15% above category average; introductory promo recommended" },
      { label: "Category Fit", status: "ok", note: "Açaí and superfood bowls are a high-growth category at Whole Foods" },
      { label: "Velocity / Proof", status: "ok", note: "$42/ft/week in comparable natural retailers is strong supporting data" },
      { label: "Margin Viability", status: "ok", note: "Premium pricing supports Whole Foods' 35–40% margin requirements" },
      { label: "Packaging / Format", status: "ok", note: "Shelf-stable, carbon-neutral packaging is channel-appropriate" },
    ],
    issues: [
      "Price point is ~15% above Whole Foods category average",
      "Limited brand awareness in the Southwest region",
    ],
    suggestions: [
      "Offer introductory promo pricing for the first 90 days",
      "Bundle with other Mana products for cross-merchandising opportunities",
      "Run a social campaign targeting local Whole Foods shoppers to build awareness",
    ],
    buyerSimulation: {
      questions: [
        "What are your current velocity numbers in similar natural channel retailers?",
        "Can you provide case pack sizes and minimum order quantities?",
        "How does your supply chain handle Brazilian Amazon sourcing disruptions?",
        "What marketing support are you prepared to bring at launch?",
      ],
      concerns: [
        "Price point is above category average — will need strong velocity data to justify placement",
        "Limited regional brand awareness in Texas and Southwest markets",
        "Frozen alternatives from established brands dominate the açaí set",
      ],
      suggestions: [
        "Provide a 90-day introductory deal to reduce buyer risk",
        "Bring IRI or SPINS data showing velocity in comparable Whole Foods-adjacent stores",
        "Offer an exclusive SKU or limited-edition flavor for Whole Foods launch",
      ],
    },
  },
  {
    retailer: "Walmart — Dallas, TX",
    retailerBrand: "Walmart",
    storeContext: "Walmart in Dallas, TX",
    focus: "Value / Price Competitive, Convenience",
    positioning:
      "Mana's Vegan Protein Bar delivers a high-value, plant-based protein option at a price point built for Walmart shoppers. At 15g protein with gluten-free and vegan certification, it captures growing demand for functional better-for-you snacking without the premium price tag.",
    talkingPoints: [
      "15g plant protein at a competitive value price point",
      "Gluten-free and vegan certifications broaden addressable audience",
      "Top 3 velocity in natural channel protein bar category — scalable to mass",
      "FSC-certified packaging aligns with Walmart's sustainability commitments",
      "Strong margin on low MOQ supports test-and-learn rollout",
    ],
    suggestedPitch:
      "Our Vegan Protein Bar delivers 15g plant protein at a price that works for Walmart shoppers. With gluten-free and vegan certifications, it taps into the growing demand for better-for-you snacking. We'd love to discuss placement in your protein bar set and share velocity data from natural channel.",
    readiness: [
      { label: "Certifications", status: "ok", note: "Vegan, Gluten-Free, Non-GMO — resonates with health-conscious Walmart shoppers" },
      { label: "Price Alignment", status: "ok", note: "Mid-tier price point is compatible with Walmart's value-oriented shelf" },
      { label: "Category Fit", status: "ok", note: "Protein bars are one of Walmart's fastest-growing snack subcategories" },
      { label: "Velocity / Proof", status: "warning", note: "Velocity is proven in natural channel; mass-market data is not yet available" },
      { label: "Margin Viability", status: "warning", note: "Walmart's margin requirements are tight; cost modeling needed before final pricing" },
      { label: "Packaging / Format", status: "ok", note: "Single-serve bar format is ideal for Walmart's impulse and checkout placement" },
    ],
    issues: [
      "Brand awareness is low in mass market — no current Walmart presence",
      "Must demonstrate value versus Walmart's private label protein bar offerings",
    ],
    suggestions: [
      "Offer an introductory distribution promo to reduce slotting risk",
      "Bring a competitive set analysis for the Walmart protein bar category",
      "Use natural channel velocity data as proof of concept for mass rollout",
    ],
    buyerSimulation: {
      questions: [
        "What is your cost per unit at Walmart scale, and what margin can you support?",
        "Do you have DSD or will you require Walmart DC distribution?",
        "What is your current national awareness — any TV, digital, or influencer spend?",
        "How does your bar compare to Quest and Kind on ingredient panel and price?",
      ],
      concerns: [
        "No mass-market velocity data — natural channel numbers may not translate",
        "Private label protein bars undercut on price; differentiation story must be very clear",
        "Limited brand awareness means Walmart bears the risk of launching an unknown SKU",
      ],
      suggestions: [
        "Come with a full cost and margin model built for Walmart scale",
        "Propose a regional test in 200–300 stores before national rollout",
        "Invest in in-store sampling or end-cap placement to drive trial",
      ],
    },
  },
  {
    retailer: "H-E-B — Houston, TX",
    retailerBrand: "HEB",
    storeContext: "H-E-B in Houston, TX",
    focus: "Premium, Health & Wellness",
    positioning:
      "Mana's Cold-Pressed Green Juice is a premium, organic addition to H-E-B's growing fresh juice set. Cold-pressed for maximum nutrient retention with no added sugar or preservatives, it's designed for the health-focused Texas shopper who demands quality and transparency.",
    talkingPoints: [
      "100% organic, cold-pressed for maximum nutrient retention",
      "No added sugar, no preservatives — clean label",
      "USDA Organic, Non-GMO, and Vegan certified",
      "Strong repeat purchase rates in comparable premium grocery markets",
      "Glass bottle packaging reinforces premium positioning",
    ],
    suggestedPitch:
      "Our Cold-Pressed Green Juice brings organic, nutrient-dense greens to H-E-B's premium juice category. With no added sugar and strong repeat rates in comparable markets, it's built for health-conscious Texas shoppers. We'd welcome the chance to present velocity and margin data at your next category review.",
    readiness: [
      { label: "Certifications", status: "ok", note: "USDA Organic, Non-GMO, Vegan — strong cert stack for H-E-B's health-focused buyers" },
      { label: "Price Alignment", status: "ok", note: "Premium price point fits H-E-B's fresh juice shelf tier" },
      { label: "Category Fit", status: "ok", note: "Cold-pressed juice is one of the fastest growing refrigerated categories at H-E-B" },
      { label: "Velocity / Proof", status: "missing", note: "No velocity data available — a significant gap for this category review" },
      { label: "Margin Viability", status: "ok", note: "Glass bottle premium format supports H-E-B's required margin" },
      { label: "Packaging / Format", status: "warning", note: "24-hour shelf life is short — refrigerated logistics must be confirmed for Texas distribution" },
    ],
    issues: [
      "No velocity data to support the pitch — this is a critical gap",
      "24-hour shelf life may create logistical challenges for Texas-wide distribution",
      "Competitive cold-pressed juice set in H-E-B is already well-developed",
    ],
    suggestions: [
      "Partner with H-E-B dietitians or wellness team for in-store demos",
      "Explore Texas-local ingredient sourcing to strengthen regional alignment",
      "Consider an H-E-B exclusive SKU or flavor to differentiate from existing set",
    ],
    buyerSimulation: {
      questions: [
        "What is your shelf life from production date, not just delivery date?",
        "Do you have a Texas-based distributor or cold chain partner?",
        "Can you provide any velocity data — even from a test market?",
        "What is your promotional calendar and trade spend commitment?",
      ],
      concerns: [
        "24-hour shelf life is a hard constraint for a state the size of Texas",
        "No velocity data is a red flag — the category is competitive and buyers need proof",
        "H-E-B has strong regional juice brands already; differentiation must be crystal clear",
      ],
      suggestions: [
        "Build a Houston-area pilot program before requesting statewide distribution",
        "Bring any available consumer panel data or social proof (reviews, press) to fill the velocity gap",
        "Offer a guaranteed sale or scan-based promotion to reduce H-E-B inventory risk",
      ],
    },
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Run with: pnpm db:seed");
  }

  console.log("Seeding database…");

  // 1. Find or create seed user
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, SEED_USER_EMAIL));
  let seedUserId: string;

  if (existingUser) {
    seedUserId = existingUser.id;
    console.log(`  Using existing user: ${SEED_USER_EMAIL}`);
  } else {
    const [newUser] = await db
      .insert(user)
      .values({
        email: SEED_USER_EMAIL,
        name: SEED_USER_NAME,
        emailVerified: true,
      })
      .returning({ id: user.id });
    if (!newUser) throw new Error("Failed to create seed user");
    seedUserId = newUser.id;
    console.log(`  Created seed user: ${SEED_USER_EMAIL}`);
  }

  // 2. Delete existing products (pitches cascade automatically)
  await db.delete(product).where(eq(product.userId, seedUserId));
  console.log("  Cleared existing products and pitches");

  // 3. Insert products
  const insertedProducts = await db
    .insert(product)
    .values(
      SEED_PRODUCTS.map((p) => ({
        userId: seedUserId,
        name: p.name,
        category: p.category,
        description: p.description,
        keySellingPoints: p.keySellingPoints,
        certifications: p.certifications,
        velocityData: p.velocityData,
        packagingSustainability: p.packagingSustainability,
        pricePositioning: p.pricePositioning,
      })),
    )
    .returning({ id: product.id, name: product.name });

  console.log(`  Inserted ${insertedProducts.length} products`);

  // 4. Insert sample pitches (one per seed pitch template, linked to the first 3 products)
  const pitchesToInsert = SEED_PITCHES.map((tmpl, i) => {
    const prod = insertedProducts[i];
    if (!prod) throw new Error(`No product at index ${i}`);
    return {
      userId: seedUserId,
      productId: prod.id,
      retailer: tmpl.retailer,
      retailerBrand: tmpl.retailerBrand,
      storeContext: tmpl.storeContext,
      focus: tmpl.focus,
      positioning: tmpl.positioning,
      talkingPoints: tmpl.talkingPoints,
      suggestedPitch: tmpl.suggestedPitch,
      readiness: tmpl.readiness,
      issues: tmpl.issues,
      suggestions: tmpl.suggestions,
      buyerSimulation: tmpl.buyerSimulation,
    };
  });

  await db.insert(pitch).values(pitchesToInsert);
  console.log(`  Inserted ${pitchesToInsert.length} sample pitches`);

  console.log("\nDone. Sign in with:", SEED_USER_EMAIL);
  console.log("(In dev, OTP is printed to the terminal after you request a code.)");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
