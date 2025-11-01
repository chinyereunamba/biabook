import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function GET() {
  try {
    // Test database connection
    const userCount = await db
      .select()
      .from(users)
      .then((res) => res.length);

    return NextResponse.json({
      status: "ok",
      message: "Database connection successful",
      userCount,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    );
  }
}
