import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { sessions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Delete all sessions for the user
    await db.delete(sessions).where(eq(sessions.userId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing sessions:", error);
    return NextResponse.json(
      { error: "Failed to clear sessions" },
      { status: 500 },
    );
  }
}
