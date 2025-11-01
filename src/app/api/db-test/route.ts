import { NextResponse } from "next/server";
import { getConnectionStatus } from "@/server/db/connection-test";

export async function GET() {
  try {
    const status = await getConnectionStatus();

    return NextResponse.json({
      status: status.connected ? "connected" : "disconnected",
      duration: status.duration,
      message: status.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
