import { NextResponse } from "next/server";
import { env } from "@/env";

export async function GET() {
  try {
    // Check WhatsApp configuration
    const config = {
      hasApiUrl: !!env.WHATSAPP_API_URL,
      hasPhoneNumberId: !!env.WHATSAPP_PHONE_NUMBER_ID,
      hasAccessToken: !!env.WHATSAPP_ACCESS_TOKEN,
      isDisabled: process.env.DISABLE_WHATSAPP === "true",
      apiUrl: env.WHATSAPP_API_URL
        ? env.WHATSAPP_API_URL.substring(0, 30) + "..."
        : "Not set",
    };

    const isConfigured =
      config.hasApiUrl &&
      config.hasPhoneNumberId &&
      config.hasAccessToken &&
      !config.isDisabled;

    return NextResponse.json({
      status: "success",
      message: "WhatsApp configuration check",
      data: {
        isConfigured,
        config,
        recommendation: isConfigured
          ? "WhatsApp is properly configured"
          : "WhatsApp is not configured or disabled. Notifications will fall back to email.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check WhatsApp configuration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
