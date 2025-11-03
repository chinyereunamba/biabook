"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Copy,
  AlertTriangle,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingButton } from "@/components/ui/loading-states";

export interface BookingDetailsData {
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

interface CustomerBookingDetailsProps {
  booking: BookingDetailsData;
  className?: string;
}

export function CustomerBookingDetails({
  booking,
  className = "",
}: CustomerBookingDetailsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const copyConfirmationNumber = async () => {
    try {
      await navigator.clipboard.writeText(booking.confirmationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy confirmation number:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCancelBooking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/bookings/${booking.id}/cancel?redirect=true`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      // The API will redirect to the cancelled page
      // This code will only run if the redirect doesn't happen
      setSuccess("Your booking has been cancelled successfully.");
      setIsCancelDialogOpen(false);

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
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

  const handleReschedule = () => {
    router.push(`/booking/${booking.id}/reschedule`);
  };

  const generateCalendarLink = (type: "google" | "outlook" | "ics") => {
    const startDateTime = new Date(
      `${booking.appointmentDate}T${booking.startTime}:00`,
    );
    const endDateTime = new Date(
      `${booking.appointmentDate}T${booking.endTime}:00`,
    );

    const title = `${booking.service.name} - ${booking.business.name}`;
    const description = `Appointment with ${booking.business.name}\n\nService: ${booking.service.name}\nDuration: ${booking.service.duration} minutes\nPrice: ${formatPrice(booking.service.price)}\n\nCustomer: ${booking.customerName}\nPhone: ${booking.customerPhone}\nEmail: ${booking.customerEmail}\n\nConfirmation: ${booking.confirmationNumber}${booking.notes ? `\n\nNotes: ${booking.notes}` : ""}`;
    const location = booking.business.location ?? booking.business.name;

    if (type === "google") {
      const googleUrl = new URL("https://calendar.google.com/calendar/render");
      googleUrl.searchParams.set("action", "TEMPLATE");
      googleUrl.searchParams.set("text", title);
      googleUrl.searchParams.set(
        "dates",
        `${startDateTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      );
      googleUrl.searchParams.set("details", description);
      googleUrl.searchParams.set("location", location);
      window.open(googleUrl.toString(), "_blank");
    } else if (type === "outlook") {
      const outlookUrl = new URL(
        "https://outlook.live.com/calendar/0/deeplink/compose",
      );
      outlookUrl.searchParams.set("subject", title);
      outlookUrl.searchParams.set("startdt", startDateTime.toISOString());
      outlookUrl.searchParams.set("enddt", endDateTime.toISOString());
      outlookUrl.searchParams.set("body", description);
      outlookUrl.searchParams.set("location", location);
      window.open(outlookUrl.toString(), "_blank");
    } else if (type === "ics") {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BiaBook//Appointment//EN",
        "BEGIN:VEVENT",
        `UID:${booking.id}@biabook.app`,
        `DTSTART:${startDateTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTEND:${endDateTime.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
        `LOCATION:${location}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `appointment-${booking.confirmationNumber}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
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

  // Check if booking is in the past
  const isInPast = () => {
    const now = new Date();
    const appointmentTime = new Date(
      `${booking.appointmentDate}T${booking.startTime}:00`,
    );
    return appointmentTime < now;
  };

  // Determine if actions are allowed
  const canCancel = booking.status !== "cancelled" && !isInPast();
  const canReschedule = booking.status !== "cancelled" && !isInPast();
  const needsApprovalForCancel = isWithinTwoHours() && canCancel;

  return (
    <div className={`mx-auto max-w-2xl ${className}`}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Your Booking Details
        </h1>
        <p className="text-lg text-gray-600">
          View and manage your appointment with {booking.business.name}
        </p>
      </div>

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Booking Status Banner */}
      {booking.status === "cancelled" && (
        <Alert variant="destructive" className="mb-6">
          <X className="h-4 w-4" />
          <AlertTitle>Booking Cancelled</AlertTitle>
          <AlertDescription>
            This booking has been cancelled and is no longer valid.
          </AlertDescription>
        </Alert>
      )}

      {/* Confirmation Details Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Confirmation Number */}
          <div className="mb-6 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Confirmation Number
              </p>
              <p className="text-xl font-bold text-blue-900">
                {booking.confirmationNumber}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={copyConfirmationNumber}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

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

      {/* Calendar Integration */}
      {booking.status !== "cancelled" && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="mb-3 flex items-center font-semibold text-green-800">
              <Calendar className="mr-2 h-5 w-5" />
              Add to Calendar
            </h3>
            <p className="mb-3 text-sm text-green-700">
              Don&apos;t forget your appointment! Add it to your calendar:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateCalendarLink("google")}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Google Calendar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateCalendarLink("outlook")}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Outlook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateCalendarLink("ics")}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Download .ics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {booking.status !== "cancelled" && (
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {canReschedule && (
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(true)}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reschedule
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(true)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Booking
            </Button>
          )}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              {needsApprovalForCancel
                ? "Your appointment is within 2 hours. Cancellation requires business approval and may be subject to their cancellation policy."
                : "Are you sure you want to cancel this booking? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-medium">{booking.service.name}</p>
              <p className="text-sm text-gray-600">
                {formatDate(booking.appointmentDate)} at{" "}
                {formatTime(booking.startTime)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <LoadingButton
              onClick={handleCancelBooking}
              loading={isLoading}
              loadingText="Processing..."
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              You&apos;ll be redirected to select a new date and time for your
              appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-medium">{booking.service.name}</p>
              <p className="text-sm text-gray-600">
                {formatDate(booking.appointmentDate)} at{" "}
                {formatTime(booking.startTime)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={handleReschedule}
              loading={isLoading}
              loadingText="Processing..."
            >
              Continue to Reschedule
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
