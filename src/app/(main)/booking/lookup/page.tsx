import type { Metadata } from "next";
import { BookingLookupForm } from "@/components/application/booking/booking-lookup-form";
import { BookingNavigation } from "@/components/application/booking/booking-navigation";

export const metadata: Metadata = {
  title: "Find Your Booking | BookMe",
  description: "Look up your booking details using your confirmation number",
};

export default function BookingLookupPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Find Your Booking
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Enter your confirmation number to view, modify, or cancel your booking
        </p>

        <BookingLookupForm />

        <div className="mt-8">
          <BookingNavigation />
        </div>
      </div>
    </div>
  );
}
