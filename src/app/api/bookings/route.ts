import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { appointments, businesses, services } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { notificationScheduler } from "@/server/notifications/notification-scheduler";

// Validation schema for booking creation
const createBookingSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  customerName: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  customerEmail: z
    .string()
    .email("Valid email is required")
    .max(255, "Email is too long"),
  customerPhone: z
    .string()
    .min(1, "Phone number is required")
    .max(50, "Phone number is too long"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createBookingSchema.safeParse(body);
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
      customerName,
      customerEmail,
      customerPhone,
      appointmentDate,
      startTime,
      endTime,
      notes,
    } = validationResult.data;

    // Verify business exists
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 },
      );
    }

    // Verify service exists and belongs to business
    const service = await db.query.services.findFirst({
      where: and(
        eq(services.id, serviceId),
        eq(services.businessId, businessId),
        eq(services.isActive, true),
      ),
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 },
      );
    }

    // Check for existing appointment at the same time slot
    const existingAppointment = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.businessId, businessId),
        eq(appointments.appointmentDate, appointmentDate),
        eq(appointments.startTime, startTime),
        eq(appointments.status, "confirmed"),
      ),
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Time slot is no longer available" },
        { status: 409 },
      );
    }

    // Validate appointment date is not in the past
    const appointmentDateTime = new Date(`${appointmentDate}T${startTime}:00`);
    const now = new Date();

    if (appointmentDateTime <= now) {
      return NextResponse.json(
        { error: "Cannot book appointments in the past" },
        { status: 400 },
      );
    }

    // Normalize phone number (basic formatting)
    const normalizedPhone = customerPhone.replace(/\D/g, "");

    // Validate phone number length (US format)
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }

    // Create the appointment
    const [newAppointment] = await db
      .insert(appointments)
      .values({
        businessId,
        serviceId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: normalizedPhone,
        appointmentDate,
        startTime,
        endTime,
        status: "confirmed",
        notes: notes?.trim(),
        servicePrice: service.price,
      })
      .returning();

    if (!newAppointment) {
      return NextResponse.json(
        { error: "Failed to create appointment" },
        { status: 500 },
      );
    }

    const appointmentForScheduler = {
      ...newAppointment,
      appointmentDate: new Date(newAppointment.appointmentDate),
    };

    // Schedule notifications for the new booking
    try {
      // Schedule confirmation notifications
      await notificationScheduler.scheduleBookingConfirmation(
        appointmentForScheduler,
        service,
        business,
      );

      // Schedule reminder notifications
      await notificationScheduler.scheduleBookingReminders(
        appointmentForScheduler,
        service,
        business,
      );
    } catch (error) {
      console.error("Failed to schedule booking notifications:", error);
      // Don't fail the booking creation if notification scheduling fails
    }

    // Return the created appointment with business and service details
    const appointmentWithDetails = {
      ...newAppointment,
      confirmationNumber: newAppointment.confirmationNumber,
      business: {
        id: business.id,
        name: business.name,
        phone: business.phone,
        email: business.email,
        location: business.location,
      },
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
      },
    };

    return NextResponse.json(
      {
        appointment: appointmentWithDetails,
        message: "Appointment booked successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
