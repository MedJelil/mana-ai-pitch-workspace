import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { product, pitch } from "@/db/schema";
import { getSessionFromHeaders } from "@/lib/auth/get-session";
import { simulateBuyerWithGemini } from "@/lib/pitch/simulate-buyer";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { pitchId, productId, retailer, pitch: pitchData } = body;

  if (
    !productId ||
    !retailer ||
    !pitchData?.positioning ||
    !pitchData?.talkingPoints ||
    !pitchData?.suggestedPitch
  ) {
    return NextResponse.json(
      {
        error:
          "productId, retailer, and pitch (positioning, talkingPoints, suggestedPitch) are required",
      },
      { status: 400 }
    );
  }

  // If the simulation was already run and saved, return it immediately
  if (pitchId) {
    const [pitchRow] = await db
      .select({ buyerSimulation: pitch.buyerSimulation })
      .from(pitch)
      .where(and(eq(pitch.id, pitchId), eq(pitch.userId, session.user.id)));

    if (pitchRow?.buyerSimulation) {
      return NextResponse.json(pitchRow.buyerSimulation);
    }
  }

  const [productRow] = await db
    .select()
    .from(product)
    .where(and(eq(product.id, productId), eq(product.userId, session.user.id)));

  if (!productRow) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const result = await simulateBuyerWithGemini(
    {
      name: productRow.name,
      category: productRow.category,
      description: productRow.description,
      keySellingPoints: (productRow.keySellingPoints as string[]) ?? [],
      certifications: (productRow.certifications as string[]) ?? [],
      velocityData: productRow.velocityData,
      packagingSustainability: productRow.packagingSustainability,
      pricePositioning: productRow.pricePositioning,
    },
    retailer,
    {
      positioning: pitchData.positioning,
      talkingPoints: Array.isArray(pitchData.talkingPoints)
        ? pitchData.talkingPoints
        : [],
      suggestedPitch: pitchData.suggestedPitch,
    }
  );

  // Persist the result so future page loads skip the AI call
  if (pitchId) {
    await db
      .update(pitch)
      .set({ buyerSimulation: result })
      .where(and(eq(pitch.id, pitchId), eq(pitch.userId, session.user.id)));
  }

  return NextResponse.json(result);
}
