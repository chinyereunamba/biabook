import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import {
  serviceRepository,
  type UpdateServiceInput,
} from "@/server/repositories/service-repository";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/dashboard/services/[id]
 * Get a specific service by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

    // Get the service
    const service = await serviceRepository.findByIdAndBusinessId(
      id,
      business.id,
    );

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Failed to fetch service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/dashboard/services/[id]
 * Update a specific service
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

    // Validate fields if provided
    if (
      body.name !== undefined &&
      (!body.name || typeof body.name !== "string")
    ) {
      return NextResponse.json(
        { error: "Service name cannot be empty" },
        { status: 400 },
      );
    }

    if (
      body.duration !== undefined &&
      (typeof body.duration !== "number" || body.duration <= 0)
    ) {
      return NextResponse.json(
        { error: "Duration must be greater than 0" },
        { status: 400 },
      );
    }

    if (
      body.price !== undefined &&
      (typeof body.price !== "number" || body.price < 0)
    ) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 },
      );
    }

    if (
      body.bufferTime !== undefined &&
      (typeof body.bufferTime !== "number" || body.bufferTime < 0)
    ) {
      return NextResponse.json(
        { error: "Buffer time cannot be negative" },
        { status: 400 },
      );
    }

    // Create update input
    const updateInput: UpdateServiceInput = {
      id: id,
      businessId: business.id,
    };

    // Only include fields that are provided
    if (body.name !== undefined) updateInput.name = body.name.trim();
    if (body.description !== undefined)
      updateInput.description = body.description?.trim();
    if (body.duration !== undefined) updateInput.duration = body.duration;
    if (body.price !== undefined) updateInput.price = body.price;
    if (body.category !== undefined)
      updateInput.category = body.category?.trim();
    if (body.bufferTime !== undefined) updateInput.bufferTime = body.bufferTime;
    if (body.isActive !== undefined) updateInput.isActive = body.isActive;

    // Update the service
    const service = await serviceRepository.update(updateInput);

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Failed to update service:", error);

    // Handle validation errors
    if (error instanceof Error) {
      if (
        error.message.includes("not found") ??
        error.message.includes("access denied")
      ) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 },
        );
      }
      if (
        error.message.includes("required") ??
        error.message.includes("cannot be")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/dashboard/services/[id]
 * Delete a specific service (soft delete by default)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

    // Check query parameters for hard delete
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    // Delete the service
    let success: boolean;
    if (hardDelete) {
      success = await serviceRepository.hardDelete(id, business.id);
    } else {
      success = await serviceRepository.softDelete(id, business.id);
    }

    if (!success) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: hardDelete
        ? "Service permanently deleted"
        : "Service deactivated",
      deleted: hardDelete,
    });
  } catch (error) {
    console.error("Failed to delete service:", error);

    // Handle validation errors
    if (error instanceof Error) {
      if (
        error.message.includes("not found") ??
        error.message.includes("access denied")
      ) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
