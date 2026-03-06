import "dotenv/config";
import { db } from "./index";
import { user, product, pitch } from "./schema";
import { eq } from "drizzle-orm";

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
    packagingSustainability: "Carbon-neutral packaging, recyclable",
    pricePositioning: "Premium",
  },
  {
    name: "Cold-Pressed Green Juice",
    category: "Beverages",
    description:
      "Kale, spinach, cucumber, celery, and lemon. Cold-pressed to retain nutrients.",
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
      "Plant-based protein with dark chocolate and almonds. 15g protein per bar.",
    keySellingPoints: [
      "15g plant protein per bar",
      "No soy, gluten-free",
      "Top 3 in natural channel protein bar category",
    ],
    certifications: ["Vegan", "Gluten-Free", "Non-GMO"],
    velocityData: "Top 3 velocity in natural channel protein bar",
    packagingSustainability: "Recyclable wrapper, FSC-certified cardboard",
    pricePositioning: "Mid-tier",
  },
  {
    name: "Coconut Water Blend",
    category: "Beverages",
    description:
      "Pure coconut water with pineapple and mango. Hydrating and naturally sweet.",
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

const SEED_PITCHES = [
  {
    retailer: "Whole Foods",
    focus: "Organic",
    positioning:
      "Mana Foods' Organic Açaí Bowl Mix is the perfect addition to Whole Foods' premium health-conscious lineup. Sourced from sustainably harvested açaí berries in the Brazilian Amazon, our product delivers unmatched nutritional density with zero artificial additives — aligning perfectly with Whole Foods' commitment to clean, organic offerings.",
    talkingPoints: [
      "100% USDA Organic certified with transparent supply chain",
      "35% higher antioxidant content than leading competitors",
      "Shelf-stable format reduces shrink by 60% vs frozen alternatives",
      "Strong velocity data: $42/linear foot/week in comparable natural retailers",
      "Supports Whole Foods' sustainability goals with carbon-neutral packaging",
    ],
    suggestedPitch:
      "We'd love to bring Mana's top-selling Açaí Bowl Mix to your stores. With proven velocity of $42/ft/week in natural channel and 100% organic certification, it's a perfect fit for your health-conscious shoppers. Our carbon-neutral packaging aligns with your sustainability commitments. Can we schedule a category review?",
    fitScore: 87,
    issues: [
      "Price point 15% above category average",
      "Limited brand awareness in Southwest region",
    ],
    suggestions: [
      "Include introductory promo pricing for first 90 days",
      "Bundle with existing Mana products for cross-merchandising",
      "Leverage social media campaign targeting local Whole Foods shoppers",
    ],
  },
  {
    retailer: "Walmart",
    focus: "Value",
    positioning:
      "Mana's Vegan Protein Bar offers Walmart shoppers a high-value, plant-based protein option at a competitive price point. With 15g protein and gluten-free certification, it meets growing demand for functional snacking without premium pricing.",
    talkingPoints: [
      "15g plant protein at value price point",
      "Gluten-free and vegan certifications",
      "Strong velocity in mass market protein bar category",
      "FSC-certified packaging supports Walmart sustainability goals",
    ],
    suggestedPitch:
      "Our Vegan Protein Bar delivers 15g plant protein at a price that works for Walmart shoppers. With gluten-free and vegan certifications, it taps into the growing demand for better-for-you snacking. We'd love to discuss placement in your protein bar set.",
    fitScore: 78,
    issues: [
      "Brand awareness lower in mass channel",
      "Need to demonstrate value vs private label",
    ],
    suggestions: [
      "Offer introductory distribution promo",
      "Provide competitive set data for category review",
      "Highlight velocity in club/natural channel as proof of concept",
    ],
  },
  {
    retailer: "HEB",
    focus: "Premium",
    positioning:
      "Mana's Cold-Pressed Green Juice fits HEB's premium fresh juice lineup. Sourced from organic greens and cold-pressed for maximum nutrition, it appeals to health-focused Texas shoppers who value quality and convenience.",
    talkingPoints: [
      "100% organic, cold-pressed for nutrient retention",
      "No added sugar or preservatives",
      "24-hour shelf life ideal for refrigerated section",
      "Vegan and Non-GMO certified",
    ],
    suggestedPitch:
      "Our Cold-Pressed Green Juice brings organic, nutrient-dense greens to HEB's premium juice category. With no added sugar and strong repeat rates in comparable markets, it's built for health-conscious shoppers. We'd welcome the chance to present velocity and margin data.",
    fitScore: 82,
    issues: [
      "Regional brand awareness in Texas",
      "Competitive refrigerated juice set",
    ],
    suggestions: [
      "Partner with HEB dietitians for in-store demos",
      "Highlight Texas-friendly sourcing where applicable",
      "Offer exclusive SKU or size for HEB",
    ],
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

  // 2. Delete existing products (and pitches via cascade) for seed user
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

  // 4. Insert sample pitches (link first 3 products to pitch templates)
  const pitchTemplates = SEED_PITCHES;
  const pitchesToInsert = insertedProducts.slice(0, 3).map((prod, i) => {
    const tmpl = pitchTemplates[i % pitchTemplates.length];
    return {
      userId: seedUserId,
      productId: prod.id,
      retailer: tmpl.retailer,
      focus: tmpl.focus,
      positioning: tmpl.positioning,
      talkingPoints: tmpl.talkingPoints,
      suggestedPitch: tmpl.suggestedPitch,
      fitScore: tmpl.fitScore,
      issues: tmpl.issues,
      suggestions: tmpl.suggestions,
    };
  });

  if (pitchesToInsert.length > 0) {
    await db.insert(pitch).values(pitchesToInsert);
  }
  console.log(`  Inserted ${pitchesToInsert.length} sample pitches`);

  console.log("Done. Sign in with:", SEED_USER_EMAIL);
  console.log(
    "(In dev, OTP is logged to the terminal when you request a code.)",
  );
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
