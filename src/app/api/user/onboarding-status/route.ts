import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businesses, services } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, session.user.id))
      .limit(1);

    if (!business) {
      return NextResponse.json({
        isOnboarded: false,
        reason: "No business found",
      });
    }

    // Check if business has at least one service
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.businessId, business.id))
      .limit(1);

    if (!service) {
      return NextResponse.json({
        isOnboarded: false,
        reason: "No services found",
      });
    }

    // User is fully onboarded
    return NextResponse.json({
      isOnboarded: true,
      businessId: business.id,
      businessName: business.name,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
