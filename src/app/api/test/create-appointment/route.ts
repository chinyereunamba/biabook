import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, businesses, services } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    console.log("🧪 Testing appointment creation...");

    // Get the first business and its first service
    const business = await db.query.businesses.findFirst({
      with: {
        services: {
          where: eq(services.isActive, true),
          limit: 1,
        },
      },
    });

    if (!business || !business.services || business.services.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "No business or services found for testing",
        },
        { status: 400 },
      );
    }

    const service = business.services[0]!;

    // Create a test appointment for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = tomorrow.toISOString().split("T")[0]!;

    console.log(
      `Creating appointment for business: ${business.name}, service: ${service.name}`,
    );

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        businessId: business.id,
        serviceId: service.id,
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "5551234567",
        appointmentDate,
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
        servicePrice: service.price,
        notes: "Test appointment created via API",
      })
      .returning();

    console.log(`✅ Created appointment: ${newAppointment.id}`);

    // Verify the appointment was saved by querying it back
    const savedAppointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, newAppointment.id),
      with: {
        business: true,
        service: true,
      },
    });

    if (!savedAppointment) {
      return NextResponse.json(
        {
          status: "error",
          message: "Appointment was not saved properly",
        },
        { status: 500 },
      );
    }

    console.log(
      `✅ Verified appointment saved: ${savedAppointment.customerName}`,
    );

    // Get total appointment count
    const allAppointments = await db.select().from(appointments);
    const totalCount = allAppointments.length;

    return NextResponse.json({
      status: "success",
      message: "Appointment created and verified successfully",
      data: {
        createdAppointment: newAppointment,
        savedAppointment,
        totalAppointmentsInDb: totalCount,
        testBusiness: {
          id: business.id,
          name: business.name,
        },
        testService: {
          id: service.id,
          name: service.name,
          price: service.price,
        },
      },
    });
  } catch (error) {
    console.error("❌ Appointment creation test failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create test appointment",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
