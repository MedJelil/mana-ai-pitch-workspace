import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { product, pitch } from "@/db/schema";
import { getSessionFromHeaders } from "@/lib/auth/get-session";
import { generatePitch } from "@/lib/pitch/generate";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch the existing pitch to get the stored context
  const [pitchRow] = await db
    .select()
    .from(pitch)
    .where(and(eq(pitch.id, id), eq(pitch.userId, session.user.id)));

  if (!pitchRow) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }

  // Fetch the latest product data (user may have updated it since the pitch was created)
  const [productRow] = await db
    .select()
    .from(product)
    .where(
      and(
        eq(product.id, pitchRow.productId),
        eq(product.userId, session.user.id)
      )
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

  // retailerBrand may be null for pitches created before this column was added —
  // fall back to the retailer display string so the AI still has something to work with
  const retailerBrand = pitchRow.retailerBrand ?? pitchRow.retailer;
  const storeContext = pitchRow.storeContext ?? pitchRow.retailer;

  const generated = await generatePitch(
    productData,
    retailerBrand,
    pitchRow.focus,
    storeContext
  );

  const [updated] = await db
    .update(pitch)
    .set({
      positioning: generated.positioning,
      talkingPoints: generated.talkingPoints,
      suggestedPitch: generated.suggestedPitch,
      readiness: generated.readiness,
      issues: generated.issues,
      suggestions: generated.suggestions,
      buyerSimulation: generated.buyerSimulation,
    })
    .where(and(eq(pitch.id, id), eq(pitch.userId, session.user.id)))
    .returning();

  return NextResponse.json({
    ...updated,
    productName: productRow.name,
  });
}
