import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { BookingRescheduleForm } from "@/components/application/booking/booking-reschedule-form";

export const metadata: Metadata = {
  title: "Reschedule Booking | BookMe",
  description: "Reschedule your appointment",
};

interface ReschedulePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReschedulePage({ params }: ReschedulePageProps) {
  const { id } = await params;

  try {
    // Fetch the appointment with related service and business
    const [bookingData] = await db
      .select({
        appointment: appointments,
        service: services,
        business: businesses,
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(businesses, eq(appointments.businessId, businesses.id))
      .where(eq(appointments.id, id))
      .limit(1);

    if (!bookingData) {
      return notFound();
    }

    // Check if the booking is cancelled
    if (bookingData.appointment.status === "cancelled") {
      return (
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold">Cannot Reschedule</h1>
            <p className="mb-6 text-gray-600">
              This booking has been cancelled and cannot be rescheduled.
            </p>
            <a
              href={`/booking/${id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Return to booking details
            </a>
          </div>
        </div>
      );
    }

    // Check if the booking is in the past
    const appointmentDate = new Date(
      `${bookingData.appointment.appointmentDate}T${bookingData.appointment.startTime}:00`,
    );
    if (appointmentDate < new Date()) {
      return (
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold">Cannot Reschedule</h1>
            <p className="mb-6 text-gray-600">
              This booking has already passed and cannot be rescheduled.
            </p>
            <a
              href={`/booking/${id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Return to booking details
            </a>
          </div>
        </div>
      );
    }

    // Format the data for the component
    const booking = {
      id: bookingData.appointment.id,
      confirmationNumber: bookingData.appointment.confirmationNumber ?? "",
      customerName: bookingData.appointment.customerName,
      customerEmail: bookingData.appointment.customerEmail,
      customerPhone: bookingData.appointment.customerPhone,
      appointmentDate: bookingData.appointment.appointmentDate,
      startTime: bookingData.appointment.startTime,
      endTime: bookingData.appointment.endTime,
      notes: bookingData.appointment.notes ?? undefined,
      status: bookingData.appointment.status,
      business: {
        id: bookingData.business.id,
        name: bookingData.business.name,
      },
      service: {
        id: bookingData.service.id,
        name: bookingData.service.name,
        duration: bookingData.service.duration,
        price: bookingData.service.price,
      },
    };

    return (
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-center text-3xl font-bold">
            Reschedule Your Booking
          </h1>
          <p className="mb-8 text-center text-gray-600">
            Select a new date and time for your appointment with{" "}
            {booking.business.name}
          </p>

          <BookingRescheduleForm booking={booking} />
        </div>
      </div>
    );
  } catch (error) {
    // Log error for debugging but don't expose details to user
    return notFound();
  }
}
