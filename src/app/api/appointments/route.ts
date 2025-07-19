import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appointmentRepository } from "@/server/repositories/appointment-repository";
import { auth } from "@/server/auth";

// Schema for creating an appointment
const createAppointmentSchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  notes: z.string().optional(),
});

// Schema for filtering appointments
const getAppointmentsSchema = z.object({
  businessId: z.string().min(1),
  status: z
    .union([
      z.enum(["pending", "confirmed", "cancelled", "completed"]),
      z.array(z.enum(["pending", "confirmed", "cancelled", "completed"])),
    ])
    .optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(["date", "created"]).default("date"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * GET /api/appointments
 * Get appointments with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    // Parse and validate query parameters
    const validatedParams = getAppointmentsSchema.parse({
      businessId,
      status: searchParams.get("status"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      search: searchParams.get("search"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
      sortBy: searchParams.get("sortBy"),
      sortDirection: searchParams.get("sortDirection"),
    });

    const result = await appointmentRepository.getByBusiness(
      validatedParams.businessId,
      {
        status: validatedParams.status,
        from: validatedParams.from,
        to: validatedParams.to,
        search: validatedParams.search,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        sortBy: validatedParams.sortBy,
        sortDirection: validatedParams.sortDirection,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting appointments:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to get appointments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/appointments
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createAppointmentSchema.parse(body);

    // Create appointment
    const appointment = await appointmentRepository.create(validatedData);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
