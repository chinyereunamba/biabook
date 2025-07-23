"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface BookingDetails {
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
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingRescheduleFormProps {
  booking: BookingDetails;
}

export function BookingRescheduleForm({ booking }: BookingRescheduleFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    parseISO(booking.appointmentDate),
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null,
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimeSlots = async () => {
      setIsLoadingTimeSlots(true);
      setError(null);

      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const response = await fetch(
          `/api/businesses/${booking.business.id}/availability?startDate=${formattedDate}&days=1&serviceId=${booking.service.id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch available time slots");
        }

        const data = await response.json();
        // Extract time slots from the availability structure
        const availabilitySlots = data.availability || [];
        const daySlots = availabilitySlots.find(
          (slot: any) => slot.date === formattedDate,
        );
        setTimeSlots(daySlots?.slots || []);
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setError("Failed to load available time slots. Please try again.");
        setTimeSlots([]);
      } finally {
        setIsLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, booking.business.id, booking.service.id]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError("Please select a date and time for your appointment");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      const response = await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentDate: formattedDate,
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          rescheduleReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reschedule booking");
      }

      // Redirect to the booking details page
      router.push(`/booking/${booking.id}?rescheduled=true`);
    } catch (err) {
      console.error("Error rescheduling booking:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reschedule booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Booking Info */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Current Booking</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span>
                {format(
                  parseISO(booking.appointmentDate),
                  "EEEE, MMMM d, yyyy",
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
            </div>
            <div>
              <span className="font-medium">{booking.service.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({booking.service.duration} minutes)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Select New Date</h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                // Disable dates in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Select New Time</h2>

          {isLoadingTimeSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Loading available times...</span>
            </div>
          ) : timeSlots && timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {timeSlots.map((slot, index) => (
                <Button
                  key={index}
                  variant={selectedTimeSlot === slot ? "primary" : "outline"}
                  className={`h-auto py-2 ${
                    !slot.available ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={() => {
                    if (slot.available) {
                      setSelectedTimeSlot(slot);
                    }
                  }}
                  disabled={!slot.available}
                >
                  {formatTime(slot.startTime)}
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              {selectedDate
                ? "No available time slots for the selected date."
                : "Please select a date to view available times."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Reason */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">
            Reason for Rescheduling (Optional)
          </h2>
          <Textarea
            placeholder="Please let us know why you're rescheduling..."
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={() => router.push(`/booking/${booking.id}`)}
        >
          Cancel
        </Button>

        <Button
          onClick={handleReschedule}
          disabled={isSubmitting ?? !selectedDate ?? !selectedTimeSlot}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Reschedule"
          )}
        </Button>
      </div>
    </div>
  );
}
