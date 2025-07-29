import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import {
  serviceRepository,
  type CreateServiceInput,
} from "@/server/repositories/service-repository";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors } from "@/server/errors/booking-errors";

/**
 * GET /api/dashboard/services
 * Get all services for the authenticated user's business
 */
async function getServices(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    throw BookingErrors.validation("Unauthorized", "authentication");
  }

  // Get the user's business
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))
    .limit(1);

  if (!business) {
    throw BookingErrors.businessNotFound(session.user.id);
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
}

/**
 * POST /api/dashboard/services
 * Create a new service for the authenticated user's business
 */
async function createService(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    throw BookingErrors.validation("Unauthorized", "authentication");
  }

  // Get the user's business
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))
    .limit(1);

  if (!business) {
    throw BookingErrors.businessNotFound(session.user.id);
  }

  // Parse request body
  const body = await request.json();

  // Validate required fields
  if (!body.name || typeof body.name !== "string") {
    throw BookingErrors.validation("Service name is required", "name");
  }

  if (
    !body.duration ||
    typeof body.duration !== "number" ||
    body.duration <= 0
  ) {
    throw BookingErrors.validation("Valid duration is required", "duration");
  }

  if (
    body.price === undefined ||
    typeof body.price !== "number" ||
    body.price < 0
  ) {
    throw BookingErrors.validation("Valid price is required", "price");
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
}

export const GET = withErrorHandler(getServices);
export const POST = withErrorHandler(createService);
