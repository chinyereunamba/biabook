"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ArrowRight,
  MessageSquare,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { AppointmentWithDetails, TimeSlot } from "@/types/booking";

interface BookingRescheduleProps {
  booking: AppointmentWithDetails;
  onReschedule: (
    bookingId: string,
    newDate: string,
    newTime: string,
    notes?: string,
    notifyCustomer?: boolean,
  ) => Promise<void>;
  onClose?: () => void;
  isOpen?: boolean;
}

export function BookingReschedule({
  booking,
  onReschedule,
  onClose,
  isOpen = true,
}: BookingRescheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
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

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split("T")[0]!; // YYYY-MM-DD format
  };

  // Fetch available time slots for the selected date
  const fetchAvailableSlots = async (date: Date) => {
    try {
      setLoadingSlots(true);
      const dateString = formatDateForAPI(date);

      const response = await fetch(
        `/api/availability?businessId=${booking.businessId}&serviceId=${booking.serviceId}&date=${dateString}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }

      const data = await response.json();
      setAvailableSlots(data.timeSlots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    if (date) {
      fetchAvailableSlots(date);
    } else {
      setAvailableSlots([]);
    }
  };

  // Check if a date is available for booking (not in the past, not today if too late)
  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Don't allow past dates
    if (selectedDate < today) {
      return false;
    }

    // For today, check if there's still time to book
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const currentHour = now.getHours();
      // Don't allow booking for today if it's after 6 PM (example business rule)
      return currentHour < 18;
    }

    return true;
  };

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setLoading(true);
      const newDate = formatDateForAPI(selectedDate);

      await onReschedule(
        booking.id,
        newDate,
        selectedTime,
        notes.trim() ?? undefined,
        notifyCustomer,
      );

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to reschedule booking:", error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const getNewEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (booking.service?.duration ?? 0));

    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
  };

  const isFormValid = selectedDate && selectedTime;
  const isNewTimeSlot =
    selectedDate &&
    selectedTime &&
    (formatDateForAPI(selectedDate) !== booking.appointmentDate.toString() ||
      selectedTime !== booking.startTime);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Reschedule Appointment
            </DialogTitle>
            <DialogDescription>
              Select a new date and time for this appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Booking Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Current Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{booking.customerName}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDate(booking.appointmentDate.toString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatTime(booking.startTime)} -{" "}
                        {formatTime(booking.endTime)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium">{booking.service?.name}</p>
                    <p className="text-xs text-gray-500">
                      {booking.service?.duration} minutes
                    </p>
                  </div>

                  <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    {booking.status}
                  </Badge>
                </CardContent>
              </Card>

              {/* New Appointment Preview */}
              {isNewTimeSlot && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      New Appointment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 pt-0">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {selectedDate &&
                          formatDate(formatDateForAPI(selectedDate))}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {formatTime(selectedTime)} -{" "}
                        {formatTime(getNewEndTime(selectedTime))}
                      </span>
                    </div>
                    <div className="rounded-md border border-green-200 bg-green-50 p-2">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="mr-1 inline h-4 w-4" />
                        New time slot confirmed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  <MessageSquare className="mr-1 inline h-4 w-4" />
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this reschedule..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Customer Notification */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyCustomer"
                  checked={notifyCustomer}
                  onCheckedChange={(checked) =>
                    setNotifyCustomer(checked as boolean)
                  }
                />
                <Label
                  htmlFor="notifyCustomer"
                  className="flex items-center text-sm"
                >
                  <Mail className="mr-1 h-4 w-4" />
                  Notify customer via email
                </Label>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select New Date</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => !isDateAvailable(date)}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Available Time Slots
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm">
                          Loading available slots...
                        </span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm">
                          No available slots for this date
                        </p>
                        <p className="text-xs">
                          Please select a different date
                        </p>
                      </div>
                    ) : (
                      <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
                        {availableSlots
                          .filter((slot) => slot.available)
                          .map((slot) => (
                            <Button
                              key={slot.time}
                              variant={
                                selectedTime === slot.time
                                  ? "primary"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedTime(slot.time)}
                              className="text-xs"
                            >
                              {formatTime(slot.time)}
                            </Button>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!isFormValid || !isNewTimeSlot || loading}
            >
              Reschedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reschedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to reschedule this appointment?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">From:</p>
                <p>{formatDate(booking.appointmentDate.toString())}</p>
                <p>
                  {formatTime(booking.startTime)} -{" "}
                  {formatTime(booking.endTime)}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">To:</p>
                <p>
                  {selectedDate && formatDate(formatDateForAPI(selectedDate))}
                </p>
                <p>
                  {selectedTime &&
                    `${formatTime(selectedTime)} - ${formatTime(getNewEndTime(selectedTime))}`}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Customer:</strong> {booking.customerName}
                <br />
                <strong>Service:</strong> {booking.service?.name}
                <br />
                {notifyCustomer && (
                  <span>The customer will be notified via email.</span>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Go Back
            </Button>
            <Button onClick={handleConfirmReschedule} disabled={loading}>
              {loading ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
