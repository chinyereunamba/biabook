import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { appointments, services, businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { CustomerBookingDetails } from "@/components/application/booking/customer-booking-details";
import { BookingRescheduledNotification } from "@/components/application/booking/booking-rescheduled-notification";

export const metadata: Metadata = {
  title: "Booking Details | BookMe",
  description: "View and manage your booking details",
};

interface BookingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookingDetailsPage({ params }: BookingPageProps) {
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
        phone: bookingData.business.phone ?? undefined,
        email: bookingData.business.email,
        location: bookingData.business.location ?? undefined,
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
        <BookingRescheduledNotification />
        <CustomerBookingDetails booking={booking} />
      </div>
    );
  } catch (error) {
    // Log error for debugging but don't expose details to user
    return notFound();
  }
}
