import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { product } from "@/db/schema";
import { getSessionFromHeaders } from "@/lib/auth/get-session";
import { simulateBuyerWithGemini } from "@/lib/pitch/simulate-buyer";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, retailer, pitch: pitchData } = body;

  if (!productId || !retailer || !pitchData?.positioning || !pitchData?.talkingPoints || !pitchData?.suggestedPitch) {
    return NextResponse.json(
      { error: "productId, retailer, and pitch (positioning, talkingPoints, suggestedPitch) are required" },
      { status: 400 }
    );
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
      talkingPoints: Array.isArray(pitchData.talkingPoints) ? pitchData.talkingPoints : [],
      suggestedPitch: pitchData.suggestedPitch,
    }
  );

  return NextResponse.json(result);
}
