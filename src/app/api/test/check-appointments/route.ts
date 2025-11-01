import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, businesses, services } from "@/server/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    console.log("🔍 Checking appointments in database...");

    // Get all appointments with business and service details
    const allAppointments = await db.query.appointments.findMany({
      with: {
        business: {
          columns: {
            id: true,
            name: true,
          },
        },
        service: {
          columns: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      limit: 10, // Limit to avoid large responses
    });

    // Get counts by status
    const appointmentsByStatus = await db
      .select({
        status: appointments.status,
        count: sql<number>`count(*)`,
      })
      .from(appointments)
      .groupBy(appointments.status);

    // Get total counts
    const totalAppointments = await db.select().from(appointments);
    const totalBusinesses = await db.select().from(businesses);
    const totalServices = await db.select().from(services);

    console.log(`Found ${totalAppointments.length} appointments in database`);

    return NextResponse.json({
      status: "success",
      message: "Appointments check completed",
      data: {
        totalCounts: {
          appointments: totalAppointments.length,
          businesses: totalBusinesses.length,
          services: totalServices.length,
        },
        appointmentsByStatus: appointmentsByStatus.map((item) => ({
          status: item.status,
          count: Number(item.count),
        })),
        recentAppointments: allAppointments.map((apt) => ({
          id: apt.id,
          customerName: apt.customerName,
          customerEmail: apt.customerEmail,
          appointmentDate: apt.appointmentDate,
          startTime: apt.startTime,
          status: apt.status,
          confirmationNumber: apt.confirmationNumber,
          business: apt.business?.name,
          service: apt.service?.name,
          servicePrice: apt.servicePrice,
          createdAt: apt.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Appointments check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check appointments",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
