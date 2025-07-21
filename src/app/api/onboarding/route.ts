import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import {
  businesses,
  services,
  weeklyAvailability,
  users,
} from "@/server/db/schema";
import { auth } from "@/server/auth";
import { eq } from "drizzle-orm";

// Validation schema for onboarding data
const onboardingSchema = z.object({
  businessData: z.object({
    name: z.string().min(1, "Business name is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().optional(),
  }),
  services: z
    .array(
      z.object({
        name: z.string().min(1, "Service name is required"),
        duration: z.string().min(1, "Duration is required"),
        price: z.string().min(1, "Price is required"),
      }),
    )
    .min(1, "At least one service is required"),
  availability: z.record(
    z.string(),
    z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = onboardingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const {
      businessData,
      services: serviceData,
      availability,
    } = validationResult.data;

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create the business
      const slug = businessData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const [business] = await tx
        .insert(businesses)
        .values({
          id: crypto.randomUUID(),
          name: businessData.name,
          description: businessData.description ?? null,
          location: businessData.address ?? null,
          phone: businessData.phone ?? null,
          email: session.user.email ?? "",
          categoryId: businessData.category,
          ownerId: session.user.id,
        })
        .returning();

      if (!business) {
        throw new Error("Failed to create business");
      }

      // Create services
      for (const service of serviceData) {
        await tx.insert(services).values({
          businessId: business.id,
          name: service.name,
          description: "",
          duration: parseInt(service.duration),
          price: parseInt(service.price) * 100, // Convert to cents
          isActive: true,
        });
      }

      // Create weekly availability
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      for (const [day, schedule] of Object.entries(availability)) {
        const dayIndex = daysOfWeek.indexOf(day);
        if (dayIndex !== -1) {
          await tx.insert(weeklyAvailability).values({
            businessId: business.id,
            dayOfWeek: dayIndex,
            startTime: schedule.start,
            endTime: schedule.end,
            isAvailable: schedule.enabled,
          });
        }
      }

      // Mark user as onboarded
      await tx
        .update(users)
        .set({
          isOnboarded: true,
          onboardedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      return NextResponse.json(
        {
          success: true,
          businessId: business.id,
          slug,
          redirectUrl: "/onboarding/success",
        },
        { status: 201 },
      );
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
