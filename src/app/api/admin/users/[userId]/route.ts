import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

const updateUserSchema = z.object({
  isOnboarded: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const body = await request.json();

    // Validate input
    const validatedData = updateUserSchema.parse(body);

    // Get current user data
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    if (validatedData.role !== undefined) {
      updateData.role = validatedData.role;
    }

    if (validatedData.isOnboarded !== undefined) {
      updateData.isOnboarded = validatedData.isOnboarded;

      // If setting needsOnboarding to false (isOnboarded to true), set onboardedAt
      if (validatedData.isOnboarded && !currentUser.isOnboarded) {
        updateData.onboardedAt = new Date();

        // Send welcome email when admin marks user as onboarded
        try {
          await sendWelcomeEmail({
            to: currentUser.email,
            name: currentUser.name || undefined,
          });
          console.log(
            `Welcome email sent to ${currentUser.email} (admin action)`,
          );
        } catch (error) {
          console.error(
            `Failed to send welcome email to ${currentUser.email}:`,
            error,
          );
          // Don't fail the update if email fails
        }
      }
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isOnboarded: updatedUser.isOnboarded,
        onboardedAt: updatedUser.onboardedAt,
        emailVerified: updatedUser.emailVerified,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

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

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboarded: user.isOnboarded,
        onboardedAt: user.onboardedAt,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
