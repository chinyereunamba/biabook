import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { env } from "@/env";

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationId } = await request.json();

    let testResult = { success: false, message: "Unknown integration" };

    switch (integrationId) {
      case "whatsapp":
        testResult = await testWhatsAppIntegration();
        break;
      case "email":
        testResult = await testEmailIntegration();
        break;
      case "payment":
        testResult = await testStripeIntegration();
        break;
      default:
        testResult = { success: false, message: "Unknown integration type" };
    }

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Integration test failed:", error);
    return NextResponse.json(
      { error: "Integration test failed" },
      { status: 500 },
    );
  }
}

async function testWhatsAppIntegration() {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return { success: false, message: "WhatsApp credentials not configured" };
  }

  try {
    // Test WhatsApp API by checking phone number info
    const response = await fetch(
      `${env.WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}`,
      {
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        },
      },
    );

    if (response.ok) {
      return { success: true, message: "WhatsApp API connection successful" };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: `WhatsApp API error: ${errorData.error?.message || "Unknown error"}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `WhatsApp connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function testEmailIntegration() {
  if (
    !env.EMAIL_SERVER_HOST ||
    !env.EMAIL_SERVER_USER ||
    !env.EMAIL_SERVER_PASSWORD
  ) {
    return { success: false, message: "Email credentials not configured" };
  }

  try {
    // In a real implementation, you would test the SMTP connection
    // For now, just check if credentials are present
    return { success: true, message: "Email configuration appears valid" };
  } catch (error) {
    return {
      success: false,
      message: `Email connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
async function testStripeIntegration() {
  if (!env.STRIPE_SECRET_KEY) {
    return { success: false, message: "Stripe credentials not configured" };
  }

  try {
    // Test Stripe API by retrieving account information
    const response = await fetch("https://api.stripe.com/v1/account", {
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      },
    });

    if (response.ok) {
      const account = await response.json();
      return {
        success: true,
        message: `Stripe connection successful. Account: ${account.display_name || account.id}`,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: `Stripe API error: ${errorData.error?.message || "Unknown error"}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Stripe connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
