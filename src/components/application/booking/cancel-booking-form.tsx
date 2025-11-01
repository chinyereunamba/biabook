"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  AlertTriangle,
  X,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export interface BookingData {
  id: string;
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: string;
  business: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    location?: string | null;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

interface CancelBookingFormProps {
  booking: BookingData;
}

export function CancelBookingForm({ booking }: CancelBookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours ?? "0"), parseInt(minutes ?? "0"));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  // Check if booking is within 2 hours (for cancellation restrictions)
  const isWithinTwoHours = () => {
    const now = new Date();
    const appointmentTime = new Date(
      `${booking.appointmentDate}T${booking.startTime}:00`,
    );
    const diffInHours =
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 2;
  };

  const needsApproval = isWithinTwoHours();

  const handleCancelBooking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      // Redirect to cancelled page on success
      router.push(`/booking/${booking.id}/cancelled`);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel booking. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Cancel Your Booking
        </h1>
        <p className="text-lg text-gray-600">
          Review your booking details before cancelling
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Warning for cancellations within 2 hours */}
      {needsApproval && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            Late Cancellation Notice
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            Your appointment is within 2 hours. Cancellation may be subject to
            the business&apos;s cancellation policy and fees may apply. Please
            contact the business directly if you have questions.
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Booking Details</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {booking.confirmationNumber}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Appointment Details */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Date & Time */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {formatDate(booking.appointmentDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold">
                    {formatTime(booking.startTime)} -{" "}
                    {formatTime(booking.endTime)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({booking.service.duration} minutes)
                  </p>
                </div>
              </div>
            </div>

            {/* Service & Price */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-semibold">{booking.service.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-green-600">
                  ${formatPrice(booking.service.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mt-6 border-t pt-4">
            <h3 className="mb-3 font-semibold">Customer Information</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{booking.customerName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{booking.customerPhone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:col-span-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{booking.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-start space-x-3">
                <MessageSquare className="mt-1 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Information */}
          <div className="mt-6 border-t pt-4">
            <h3 className="mb-3 font-semibold">Business Information</h3>
            <div className="space-y-2">
              <p className="font-medium">{booking.business.name}</p>

              {booking.business.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.business.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm">
                {booking.business.phone && (
                  <a
                    href={`tel:${booking.business.phone}`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{booking.business.phone}</span>
                  </a>
                )}

                {booking.business.email && (
                  <a
                    href={`mailto:${booking.business.email}`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{booking.business.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </Button>

        <Button
          onClick={handleCancelBooking}
          disabled={isLoading}
          variant="destructive"
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Cancelling...</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span>Cancel Booking</span>
            </>
          )}
        </Button>
      </div>

      {/* Contact Business Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Need to reschedule instead?{" "}
          <Link
            href={`/booking/${booking.id}/reschedule`}
            className="text-blue-600 hover:text-blue-800"
          >
            Reschedule your appointment
          </Link>
        </p>
      </div>
    </div>
  );
}
