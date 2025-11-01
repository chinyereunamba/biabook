import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function GET() {
  try {
    const session = await auth();

    return NextResponse.json({
      hasSession: !!session,
      session: session
        ? {
            user: {
              id: session.user?.id,
              name: session.user?.name,
              email: session.user?.email,
              role: (session.user as any)?.role,
              isOnboarded: (session.user as any)?.isOnboarded,
            },
          }
        : null,
      isAdmin: (session?.user as any)?.role === "admin",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Session debug error:", error);
    return NextResponse.json(
      {
        error: "Failed to get session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
