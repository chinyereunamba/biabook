import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's business if it exists
    const userBusiness = session.user.isOnboarded
      ? await db
          .select()
          .from(businesses)
          .where(eq(businesses.ownerId, session.user.id))
          .limit(1)
          .then((res) => res[0] ?? null)
      : null;

    return NextResponse.json({
      isOnboarded: !!session.user.isOnboarded,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      business: userBusiness
        ? {
            id: userBusiness.id,
            name: userBusiness.name,
          }
        : null,
    });
  } catch (error) {
    console.error("User status error:", error);
    return NextResponse.json(
      { error: "Failed to get user status" },
      { status: 500 },
    );
  }
}
