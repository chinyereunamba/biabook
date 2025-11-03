import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        message: "Not authenticated",
      });
    }

    // Get user from database to verify role
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      authenticated: true,
      session: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        isOnboarded: session.user.isOnboarded,
        needsOnboarding: session.user.needsOnboarding,
      },
      dbUser: dbUser
        ? {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            isOnboarded: dbUser.isOnboarded,
            onboardedAt: dbUser.onboardedAt,
          }
        : null,
      roleAssignment: {
        sessionRole: session.user.role,
        dbRole: dbUser?.role,
        isAdmin: session.user.role === "admin",
        adminEmails: ["chinyereunamba15@gmail.com", "admin@biabook.com"],
        userEmail: session.user.email,
        shouldBeAdmin: [
          "chinyereunamba15@gmail.com",
          "admin@biabook.com",
        ].includes(session.user.email || ""),
      },
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
