import { NextRequest, NextResponse } from "next/server";
import { createUserWithCredentials } from "@/lib/auth-utils";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Create user
    const user = await createUserWithCredentials(
      validatedData.email,
      validatedData.password,
      validatedData.name,
    );

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendVerificationEmail({
        to: user.email,
        verificationUrl,
      });
      console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
      console.error(
        `Failed to send verification email to ${user.email}:`,
        error,
      );
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "User created successfully. Please check your email to verify your account.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
