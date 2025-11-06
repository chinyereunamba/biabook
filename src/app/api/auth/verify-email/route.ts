import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!token || !email) {
      return NextResponse.redirect(
        `${baseUrl}/error?message=Invalid verification link`,
      );
    }

    // Find user by ID and email
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, token), eq(users.email, email)))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(
        `${baseUrl}/error?message=Invalid verification link`,
      );
    }

    if (user.emailVerified) {
      return NextResponse.redirect(
        `${baseUrl}/login?message=Email already verified`,
      );
    }

    // Update user as verified
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: user.email,
        name: user.name || undefined,
      });
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${user.email}:`, error);
      // Don't fail verification if welcome email fails
    }

    return NextResponse.redirect(
      `${baseUrl}/login?message=Email verified successfully! You can now sign in.`,
    );
  } catch (error) {
    console.error("Email verification error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/error?message=Verification failed`,
    );
  }
}
