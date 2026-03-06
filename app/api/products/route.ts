import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { product } from "@/db/schema";
import { getSessionFromHeaders } from "@/lib/auth/get-session";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await db
    .select()
    .from(product)
    .where(eq(product.userId, session.user.id))
    .orderBy(desc(product.createdAt));

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromHeaders(req.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    category,
    description,
    keySellingPoints = [],
    certifications = [],
    velocityData,
    packagingSustainability,
    pricePositioning,
  } = body;

  if (!name || !category || typeof description !== "string") {
    return NextResponse.json(
      { error: "name, category, and description are required" },
      { status: 400 }
    );
  }

  const [inserted] = await db
    .insert(product)
    .values({
      userId: session.user.id,
      name: String(name).trim(),
      category: String(category).trim(),
      description: String(description).trim(),
      keySellingPoints: Array.isArray(keySellingPoints) ? keySellingPoints : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      velocityData: velocityData ? String(velocityData).trim() : null,
      packagingSustainability: packagingSustainability
        ? String(packagingSustainability).trim()
        : null,
      pricePositioning: pricePositioning ? String(pricePositioning).trim() : null,
    })
    .returning();

  return NextResponse.json(inserted);
}
