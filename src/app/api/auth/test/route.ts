import { NextResponse } from "next/server";
import { env } from "@/env";

export async function GET() {
  try {
    // Test if environment variables are properly loaded
    const config = {
      hasAuthSecret: !!env.AUTH_SECRET,
      hasGoogleId: !!env.AUTH_GOOGLE_ID,
      hasGoogleSecret: !!env.AUTH_GOOGLE_SECRET,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: "ok",
      config,
      message: "Auth configuration test",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
