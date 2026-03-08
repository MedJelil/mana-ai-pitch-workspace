import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { product, pitch } from "@/db/schema";
import { getSessionFromHeaders } from "@/lib/auth/get-session";
import { generatePitch } from "@/lib/pitch/generate";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pitchesList = await db
    .select({
      id: pitch.id,
      productId: pitch.productId,
      productName: product.name,
      retailer: pitch.retailer,
      focus: pitch.focus,
      fitScore: pitch.fitScore,
      createdAt: pitch.createdAt,
      positioning: pitch.positioning,
      talkingPoints: pitch.talkingPoints,
      suggestedPitch: pitch.suggestedPitch,
      issues: pitch.issues,
      suggestions: pitch.suggestions,
    })
    .from(pitch)
    .innerJoin(product, eq(pitch.productId, product.id))
    .where(eq(pitch.userId, session.user.id))
    .orderBy(desc(pitch.createdAt));

  return NextResponse.json(pitchesList);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, focus, storeInfo } = body;

  if (!productId || !focus || !storeInfo?.retailerBrand || !storeInfo?.storeName) {
    return NextResponse.json(
      { error: "productId, focus, and storeInfo (retailerBrand, storeName) are required" },
      { status: 400 }
    );
  }

  // Build human-readable retailer string stored in DB
  const retailer = storeInfo.city && storeInfo.state
    ? `${storeInfo.storeName} (${storeInfo.city}, ${storeInfo.state})`
    : storeInfo.storeName;

  // City + state give useful regional context; street address doesn't add signal
  const locationParts = [storeInfo.city, storeInfo.state].filter(Boolean).join(", ");
  const storeContext = locationParts
    ? `${storeInfo.storeName} in ${locationParts}`
    : storeInfo.storeName;

  const [productRow] = await db
    .select()
    .from(product)
    .where(
      and(eq(product.id, productId), eq(product.userId, session.user.id))
  );

  if (!productRow) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const productData = {
    name: productRow.name,
    category: productRow.category,
    description: productRow.description,
    keySellingPoints: (productRow.keySellingPoints as string[]) ?? [],
    certifications: (productRow.certifications as string[]) ?? [],
    velocityData: productRow.velocityData,
    packagingSustainability: productRow.packagingSustainability,
    pricePositioning: productRow.pricePositioning,
  };

  // Single AI call — returns pitch + buyer simulation together
  const generated = await generatePitch(
    productData,
    storeInfo.retailerBrand,
    focus,
    storeContext
  );

  const [inserted] = await db
    .insert(pitch)
    .values({
      userId: session.user.id,
      productId: productRow.id,
      retailer,
      focus,
      positioning: generated.positioning,
      talkingPoints: generated.talkingPoints,
      suggestedPitch: generated.suggestedPitch,
      fitScore: generated.fitScore,
      issues: generated.issues,
      suggestions: generated.suggestions,
      buyerSimulation: generated.buyerSimulation,
    })
    .returning();

  return NextResponse.json({
    ...inserted,
    productName: productRow.name,
  });
}
