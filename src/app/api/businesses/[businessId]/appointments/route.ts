import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, services } from "@/server/db/schema";
import { eq, and, desc, gte, count } from "drizzle-orm";
import { auth } from "@/server/auth";
import { getCurrentUserBusiness } from "@/server/auth/helpers";

// GET /api/businesses/:businessId/appointments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real app, you would check if the user has access to this business
    // For now, we'll assume they do

    const { businessId } = await params;
    const url = new URL(req.url);

    // Parse query parameters
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status");
    const startDate = url.searchParams.get("startDate");

    // Build query conditions
    const conditions = [eq(appointments.businessId, businessId)];

    if (status) {
      conditions.push(eq(appointments.status, status as "pending" | "confirmed" | "cancelled" | "completed"));
    }

    if (startDate) {
      conditions.push(gte(appointments.appointmentDate, startDate));
    }

    // Query appointments with service details
    const appointmentsData = await db
      .select({
        id: appointments.id,
        customerName: appointments.customerName,
        customerEmail: appointments.customerEmail,
        customerPhone: appointments.customerPhone,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        notes: appointments.notes,
        confirmationNumber: appointments.confirmationNumber,
        createdAt: appointments.createdAt,
        serviceName: services.name,
        servicePrice: services.price,
        serviceDuration: services.duration,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(...conditions))
      .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime))
      .limit(limit)
      .offset(offset);

    // Count total appointments for pagination
    const totalCountResult = await db
      .select({ count: count() }) // ✅ use the imported `count()`
      .from(appointments)
      .where(and(...conditions));

    const totalCount = totalCountResult[0]?.count ?? 0;

    return NextResponse.json({
      appointments: appointmentsData,
      pagination: {
        total: Number(totalCount),
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}
