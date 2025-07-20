import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// GET /api/me/business
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user's business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, session.user.id))
      .limit(1);

    if (!business) {
      // For demo purposes, return a default business
      return NextResponse.json({
        business: {
          id: "business-1",
          name: "Demo Business",
          ownerId: session.user.id,
          categoryId: "salon",
          description: "A demo business for testing",
          location: "123 Main St, Anytown, USA",
          phone: "555-123-4567",
          email: "demo@example.com",
        },
      });
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Error fetching current user's business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 },
    );
  }
}
