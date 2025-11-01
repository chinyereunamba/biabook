import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function GET() {
  try {
    const session = await auth();

    return NextResponse.json({
      success: true,
      hasSession: !!session,
      user: session?.user
        ? {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: (session.user as any)?.role,
            isOnboarded: (session.user as any)?.isOnboarded,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Auth test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
