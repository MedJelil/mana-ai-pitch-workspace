import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { product, pitch } from "@/db/schema";
import { getSessionFromHeaders } from "@/lib/auth/get-session";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [pitchRow] = await db
    .select({
      id: pitch.id,
      productId: pitch.productId,
      productName: product.name,
      retailer: pitch.retailer,
      focus: pitch.focus,
      readiness: pitch.readiness,
      createdAt: pitch.createdAt,
      positioning: pitch.positioning,
      talkingPoints: pitch.talkingPoints,
      suggestedPitch: pitch.suggestedPitch,
      issues: pitch.issues,
      suggestions: pitch.suggestions,
      buyerSimulation: pitch.buyerSimulation,
    })
    .from(pitch)
    .innerJoin(product, eq(pitch.productId, product.id))
    .where(and(eq(pitch.id, id), eq(pitch.userId, session.user.id)));

  if (!pitchRow) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }

  return NextResponse.json(pitchRow);
}
