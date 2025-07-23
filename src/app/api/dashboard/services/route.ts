import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import {
  serviceRepository,
  type CreateServiceInput,
} from "@/server/repositories/service-repository";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/dashboard/services
 * Get all services for the authenticated user's business
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, session.user.id))
      .limit(1);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Get services for the business
    const services = await serviceRepository.findByBusinessId(
      business.id,
      includeInactive,
    );

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/dashboard/services
 * Create a new service for the authenticated user's business
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, session.user.id))
      .limit(1);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 },
      );
    }

    if (
      !body.duration ||
      typeof body.duration !== "number"||
      body.duration <= 0
    ) {
      return NextResponse.json(
        { error: "Valid duration is required" },
        { status: 400 },
      );
    }

    if (
      body.price === undefined ||
      typeof body.price !== "number" ||
      body.price < 0
    ) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 },
      );
    }

    // Create service input
    const serviceInput: CreateServiceInput = {
      businessId: business.id,
      name: body.name.trim(),
      description: body.description?.trim() || undefined,
      duration: body.duration,
      price: body.price,
      category: body.category?.trim() || undefined,
      bufferTime: body.bufferTime || 0,
      isActive: body.isActive || true,
    };

    // Create the service
    const service = await serviceRepository.create(serviceInput);

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("required")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
