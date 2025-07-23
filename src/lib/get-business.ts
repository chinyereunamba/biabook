// lib/get-business.ts
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { Business } from "@/types/business";

export async function getBusiness(): Promise<Business | null> {
  const session = await auth();

  if (!session?.user?.id) return null;

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))
    .limit(1);

  if (!business) return null;

  // Transform the database business to match the Business type
  return {
    id: business.id,
    name: business.name,
    slug: business.slug, // Using ID as slug if not available
    description: business.description ?? null,
    address: business.location ?? undefined,
    phone: business.phone ?? null,
    email: business.email ?? null,
    website: undefined, // Not available in current schema
    logo: undefined, // Not available in current schema
    ownerId: business.ownerId,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt ?? new Date(),
  };
}
