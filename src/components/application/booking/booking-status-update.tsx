"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Save,
} from "lucide-react";
import type { AppointmentWithDetails } from "@/types/booking";

interface BookingStatusUpdateProps {
  booking: AppointmentWithDetails;
  onStatusUpdate: (
    bookingId: string,
    status: "pending" | "confirmed" | "cancelled" | "completed",
    notes?: string,
  ) => Promise<void>;
  onClose?: () => void;
  isOpen?: boolean;
}

export function BookingStatusUpdate({
  booking,
  onStatusUpdate,
  onClose,
  isOpen = true,
}: BookingStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState(booking.status);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      description: "Waiting for confirmation",
      icon: <AlertCircle className="h-4 w-4" />,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      description: "Appointment confirmed",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      value: "completed",
      label: "Completed",
      description: "Service completed successfully",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      description: "Appointment cancelled",
      icon: <XCircle className="h-4 w-4" />,
      color: "bg-red-100 text-red-800 border-red-200",
    },
  ];

  const getCurrentStatus = () => {
    return statusOptions.find((option) => option.value === booking.status);
  };

  const getSelectedStatus = () => {
    return statusOptions.find((option) => option.value === selectedStatus);
  };

  const handleStatusChange = (
    newStatus: "pending" | "confirmed" | "cancelled" | "completed",
  ) => {
    setSelectedStatus(newStatus);

    // Show confirmation dialog for destructive actions
    if (newStatus === "cancelled" && booking.status !== "cancelled") {
      setShowConfirmDialog(true);
    }
  };

  const handleSave = async () => {
    if (selectedStatus === booking.status && !notes.trim()) {
      return; // No changes to save
    }

    try {
      setLoading(true);
      await onStatusUpdate(
        booking.id,
        selectedStatus,
        notes.trim() ?? undefined,
      );
      if (onClose) {
        onClose();
      }
    } catch (error) {
      // Error will be handled by the parent component's error handling
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    setShowConfirmDialog(false);
    await handleSave();
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
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

  const hasChanges = selectedStatus !== booking.status || notes.trim();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of this appointment and add optional notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{booking.customerName}</h3>
                    <p className="text-sm text-gray-600">
                      {booking.service?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(booking.appointmentDate)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatTime(booking.startTime)} -{" "}
                      {formatTime(booking.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>
                    <Badge
                      className={`${getCurrentStatus()?.color} flex w-fit items-center`}
                    >
                      {getCurrentStatus()?.icon}
                      <span className="ml-1">{getCurrentStatus()?.label}</span>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Confirmation</p>
                    <p className="font-mono text-sm">
                      {booking.confirmationNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Selection */}
            <div className="space-y-3">
              <Label htmlFor="status">New Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  handleStatusChange(
                    value as
                      | "pending"
                      | "confirmed"
                      | "cancelled"
                      | "completed",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        {option.icon}
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-gray-500">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStatus !== booking.status && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">Changing from</span>
                      <Badge className={`${getCurrentStatus()?.color} text-xs`}>
                        {getCurrentStatus()?.label}
                      </Badge>
                    </div>
                    <span className="text-sm">to</span>
                    <Badge className={`${getSelectedStatus()?.color} text-xs`}>
                      {getSelectedStatus()?.label}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes">
                <MessageSquare className="mr-1 inline h-4 w-4" />
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                These notes will be added to the booking history.
              </p>
            </div>

            {/* Status Change Warnings */}
            {selectedStatus === "cancelled" &&
              booking.status !== "cancelled" && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start space-x-2">
                    <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-800">
                        Cancelling Appointment
                      </h4>
                      <p className="text-sm text-red-700">
                        This will cancel the appointment and notify the
                        customer. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {selectedStatus === "completed" &&
              booking.status !== "completed" && (
                <div className="rounded-md border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">
                        Marking as Completed
                      </h4>
                      <p className="text-sm text-green-700">
                        This will mark the service as completed and update the
                        booking history.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Destructive Actions */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              {selectedStatus === "cancelled" && (
                <>
                  Are you sure you want to cancel this appointment? The customer
                  will be notified and this action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Keep Current Status
            </Button>
            <Button
              variant={
                selectedStatus === "cancelled" ? "destructive" : "default"
              }
              onClick={handleConfirmStatusChange}
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : `Change to ${getSelectedStatus()?.label}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
