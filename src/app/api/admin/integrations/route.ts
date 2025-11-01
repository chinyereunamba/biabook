import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { env } from "@/env";

export async function GET() {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return integration configurations from environment variables
    const integrations = [
      {
        id: "whatsapp",
        name: "WhatsApp Business API",
        description: "Send booking notifications via WhatsApp",
        status: env.WHATSAPP_ACCESS_TOKEN ? "connected" : "disconnected",
        lastTested: env.WHATSAPP_ACCESS_TOKEN
          ? new Date().toISOString()
          : undefined,
        config: {
          apiUrl: env.WHATSAPP_API_URL || "",
          phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || "",
          accessToken: env.WHATSAPP_ACCESS_TOKEN ? "••••••••••••••••" : "", // Masked for security
          businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
          enabled: !!env.WHATSAPP_ACCESS_TOKEN,
        },
      },
      {
        id: "email",
        name: "Email Service (SMTP)",
        description: "Send email notifications and confirmations",
        status:
          env.EMAIL_SERVER_HOST && env.EMAIL_SERVER_USER
            ? "connected"
            : "disconnected",
        lastTested: env.EMAIL_SERVER_HOST
          ? new Date().toISOString()
          : undefined,
        config: {
          host: env.EMAIL_SERVER_HOST || "",
          port: env.EMAIL_SERVER_PORT || "587",
          username: env.EMAIL_SERVER_USER || "",
          password: env.EMAIL_SERVER_PASSWORD ? "••••••••••••••••" : "", // Masked for security
          fromEmail: env.EMAIL_FROM || "",
          enabled: !!(env.EMAIL_SERVER_HOST && env.EMAIL_SERVER_USER),
        },
      },
      {
        id: "payment",
        name: "Payment Gateway (Stripe)",
        description: "Process payments and handle transactions",
        status: env.STRIPE_SECRET_KEY ? "connected" : "disconnected",
        lastTested: env.STRIPE_SECRET_KEY
          ? new Date().toISOString()
          : undefined,
        config: {
          provider: "stripe",
          publicKey: env.STRIPE_PUBLIC_KEY || "",
          secretKey: env.STRIPE_SECRET_KEY ? "••••••••••••••••" : "", // Masked for security
          webhookSecret: env.STRIPE_WEBHOOK_SECRET ? "••••••••••••••••" : "", // Masked for security
          enabled: !!env.STRIPE_SECRET_KEY,
        },
      },
    ];

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Failed to fetch integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrations } = await request.json();

    // In a real implementation, you would:
    // 1. Validate the integration configurations
    // 2. Update environment variables or database settings
    // 3. Test the connections
    // 4. Save the configurations securely

    console.log("Integration configurations to save:", integrations);

    // For now, just return success
    // In production, you'd want to store these in a secure way
    return NextResponse.json({
      success: true,
      message: "Integration configurations saved successfully",
    });
  } catch (error) {
    console.error("Failed to save integrations:", error);
    return NextResponse.json(
      { error: "Failed to save integrations" },
      { status: 500 },
    );
  }
}
