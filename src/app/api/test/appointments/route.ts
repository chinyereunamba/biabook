import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, businesses, services } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Test 1: Check if we can query appointments table
    const appointmentCount = await db
      .select()
      .from(appointments)
      .then((res) => res.length);

    // Test 2: Get a sample of recent appointments
    const recentAppointments = await db
      .select({
        id: appointments.id,
        businessId: appointments.businessId,
        customerName: appointments.customerName,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        status: appointments.status,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .limit(5);

    // Test 3: Check if we can join with businesses and services
    const appointmentsWithDetails = await db
      .select({
        appointmentId: appointments.id,
        customerName: appointments.customerName,
        businessName: businesses.name,
        serviceName: services.name,
        appointmentDate: appointments.appointmentDate,
        status: appointments.status,
      })
      .from(appointments)
      .innerJoin(businesses, eq(appointments.businessId, businesses.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .limit(3);

    return NextResponse.json({
      status: "success",
      message: "Appointments database test completed",
      data: {
        totalAppointments: appointmentCount,
        recentAppointments,
        appointmentsWithDetails,
      },
    });
  } catch (error) {
    console.error("Appointments database test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to test appointments database",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    // Test creating a sample appointment
    const testBusinessId = "test-business-" + Date.now();
    const testServiceId = "test-service-" + Date.now();

    // First create a test business
    const [testBusiness] = await db
      .insert(businesses)
      .values({
        id: testBusinessId,
        name: "Test Business",
        slug: "test-business",
        categoryId: "test-category",
        ownerId: "test-owner",
        description: "Test business for appointment testing",
        location: "Test Location",
        phone: "555-0123",
        email: "test@example.com",
      })
      .returning();

    // Create a test service
    const [testService] = await db
      .insert(services)
      .values({
        id: testServiceId,
        businessId: testBusinessId,
        name: "Test Service",
        duration: 60,
        price: 5000, // $50.00
        isActive: true,
      })
      .returning();

    // Create a test appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = tomorrow.toISOString().split("T")[0];

    const [testAppointment] = await db
      .insert(appointments)
      .values({
        businessId: testBusinessId,
        serviceId: testServiceId,
        customerName: "Test Customer",
        customerEmail: "customer@test.com",
        customerPhone: "5551234567",
        appointmentDate: appointmentDate!,
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
        servicePrice: 5000,
        notes: "Test appointment created via API test",
      })
      .returning();

    return NextResponse.json({
      status: "success",
      message: "Test appointment created successfully",
      data: {
        business: testBusiness,
        service: testService,
        appointment: testAppointment,
      },
    });
  } catch (error) {
    console.error("Test appointment creation error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create test appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
