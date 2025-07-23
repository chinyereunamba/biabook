import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingConflictService } from "@/server/services/booking-conflict-service";

// Validation schema for availability check
const availabilityCheckSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  excludeAppointmentId: z.string().optional(),
});

/**
 * POST /api/availability/check
 * Real-time availability checking endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = availabilityCheckSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      businessId,
      serviceId,
      appointmentDate,
      startTime,
      excludeAppointmentId,
    } = validationResult.data;

    // Check availability using the booking conflict service
    const availabilityResult =
      await bookingConflictService.validateBookingRequest({
        businessId,
        serviceId,
        appointmentDate,
        startTime,
        excludeAppointmentId,
      });

    const response = {
      available: availabilityResult.isAvailable,
      conflicts: availabilityResult.conflicts,
      suggestions: availabilityResult.suggestions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/availability/check
 * Real-time availability checking via query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryData = {
      businessId: searchParams.get("businessId") ?? "",
      serviceId: searchParams.get("serviceId") ?? "",
      appointmentDate: searchParams.get("appointmentDate") ?? "",
      startTime: searchParams.get("startTime") ?? "",
      excludeAppointmentId:
        searchParams.get("excludeAppointmentId") ?? undefined,
    };

    // Validate query parameters
    const validationResult = availabilityCheckSchema.safeParse(queryData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      businessId,
      serviceId,
      appointmentDate,
      startTime,
      excludeAppointmentId,
    } = validationResult.data;

    // Check availability using the booking conflict service
    const availabilityResult =
      await bookingConflictService.validateBookingRequest({
        businessId,
        serviceId,
        appointmentDate,
        startTime,
        excludeAppointmentId,
      });

    const response = {
      available: availabilityResult.isAvailable,
      conflicts: availabilityResult.conflicts,
      suggestions: availabilityResult.suggestions,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
