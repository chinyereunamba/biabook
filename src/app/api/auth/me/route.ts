import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getCurrentUser } from "@/server/auth/helpers";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get full user details from database
    const user = await getCurrentUser();

    return NextResponse.json({
      session: {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role,
          isOnboarded: session.user.isOnboarded,
          needsOnboarding: session.user.needsOnboarding,
        },
      },
      dbUser: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
