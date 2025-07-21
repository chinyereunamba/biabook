import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, session.user.id))
      .limit(1);

    return NextResponse.json({
      business: business ?? null,
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 },
    );
  }
}
