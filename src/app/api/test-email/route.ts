import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, name, type = "welcome" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let result;

    if (type === "verification") {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=test-token&email=${encodeURIComponent(email)}`;

      result = await sendVerificationEmail({
        to: email,
        verificationUrl,
      });
    } else {
      result = await sendWelcomeEmail({
        to: email,
        name: name || "Test User",
      });
    }

    if (result.success) {
      return NextResponse.json({
        message: `Test ${type} email sent successfully`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in test-email endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
