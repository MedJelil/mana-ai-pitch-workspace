import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { product } from "@/db/schema";
import { getSessionFromHeaders } from "@/lib/auth/get-session";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const {
    name,
    category,
    description,
    keySellingPoints,
    certifications,
    velocityData,
    packagingSustainability,
    pricePositioning,
  } = body;

  const updates: Partial<typeof product.$inferInsert> = {};

  if (name !== undefined) updates.name = String(name).trim();
  if (category !== undefined) updates.category = String(category).trim();
  if (description !== undefined) updates.description = String(description).trim();
  if (keySellingPoints !== undefined)
    updates.keySellingPoints = Array.isArray(keySellingPoints) ? keySellingPoints : [];
  if (certifications !== undefined)
    updates.certifications = Array.isArray(certifications) ? certifications : [];
  if (velocityData !== undefined)
    updates.velocityData = velocityData ? String(velocityData).trim() : null;
  if (packagingSustainability !== undefined)
    updates.packagingSustainability = packagingSustainability
      ? String(packagingSustainability).trim()
      : null;
  if (pricePositioning !== undefined)
    updates.pricePositioning = pricePositioning ? String(pricePositioning).trim() : null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(product)
    .set(updates)
    .where(and(eq(product.id, id), eq(product.userId, session.user.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(product)
    .where(and(eq(product.id, id), eq(product.userId, session.user.id)))
    .returning({ id: product.id });

  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
