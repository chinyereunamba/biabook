"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Mail,
  Phone,
} from "lucide-react";
import { type AppointmentWithDetails } from "@/types/booking";

interface BookingCancellationProps {
  booking: AppointmentWithDetails;
  onCancel: (
    bookingId: string,
    reason: string,
    notifyCustomer: boolean,
    refundAmount?: number,
  ) => Promise<void>;
  onClose?: () => void;
  isOpen?: boolean;
}

const cancellationReasons = [
  { value: "customer_request", label: "Customer Request" },
  { value: "business_closure", label: "Business Closure" },
  { value: "staff_unavailable", label: "Staff Unavailable" },
  { value: "emergency", label: "Emergency" },
  { value: "weather", label: "Weather Conditions" },
  { value: "equipment_failure", label: "Equipment Failure" },
  { value: "double_booking", label: "Double Booking" },
  { value: "other", label: "Other" },
];

export function BookingCancellation({
  booking,
  onCancel,
  onClose,
  isOpen = true,
}: BookingCancellationProps) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
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

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  const getTimeUntilAppointment = () => {
    const appointmentDateTime = new Date(
      `${booking.appointmentDate}T${booking.startTime}:00`,
    );
    const now = new Date();
    const diffInHours =
      (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 0) {
      return "Past appointment";
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)} hours`;
    } else {
      return `${Math.round(diffInHours / 24)} days`;
    }
  };

  const getCancellationPolicy = () => {
    const timeUntil = getTimeUntilAppointment();
    const appointmentDateTime = new Date(
      `${booking.appointmentDate}T${booking.startTime}:00`,
    );
    const now = new Date();
    const diffInHours =
      (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 0) {
      return {
        type: "past",
        message: "This appointment has already passed",
        refundEligible: false,
        maxRefund: 0,
      };
    } else if (diffInHours < 2) {
      return {
        type: "last_minute",
        message: "Less than 2 hours notice - limited refund available",
        refundEligible: true,
        maxRefund: booking.service.price * 0.5, // 50% refund
      };
    } else if (diffInHours < 24) {
      return {
        type: "same_day",
        message: "Same day cancellation - partial refund available",
        refundEligible: true,
        maxRefund: booking.service.price * 0.75, // 75% refund
      };
    } else {
      return {
        type: "advance",
        message: "24+ hours notice - full refund available",
        refundEligible: true,
        maxRefund: booking.service.price, // 100% refund
      };
    }
  };

  const policy = getCancellationPolicy();

  const handleCancel = () => {
    if (!reason) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setLoading(true);
      const finalReason =
        reason === "other"
          ? customReason
          : (cancellationReasons.find((r) => r.value === reason)?.label ??
            reason);

      await onCancel(booking.id, finalReason, notifyCustomer, refundAmount);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const isFormValid = reason && (reason !== "other" || customReason.trim());

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <XCircle className="mr-2 h-5 w-5" />
              Cancel Appointment
            </DialogTitle>
            <DialogDescription>
              Cancel this appointment and optionally process a refund for the
              customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">
                        {booking.customerName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{booking.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  </div>
                  <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    {booking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="mb-1 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Date</span>
                    </div>
                    <p>{formatDate(booking.appointmentDate)}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Time</span>
                    </div>
                    <p>
                      {formatTime(booking.startTime)} -{" "}
                      {formatTime(booking.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Service</p>
                    <p>{booking.service.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Price</p>
                    <p className="font-semibold text-green-600">
                      ${formatPrice(booking.service.price)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Time until appointment: {getTimeUntilAppointment()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div
                  className={`rounded-md border p-3 ${
                    policy.type === "advance"
                      ? "border-green-200 bg-green-50"
                      : policy.type === "same_day"
                        ? "border-yellow-200 bg-yellow-50"
                        : policy.type === "last_minute"
                          ? "border-orange-200 bg-orange-50"
                          : "border-red-200 bg-red-50"
                  }`}
                >
                  <p className="mb-2 text-sm font-medium">{policy.message}</p>
                  {policy.refundEligible && (
                    <p className="text-sm">
                      Maximum refund available:{" "}
                      <span className="font-semibold">
                        ${formatPrice(policy.maxRefund)}
                      </span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Reason */}
            <div className="space-y-3">
              <Label htmlFor="reason">Reason for Cancellation *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map((reasonOption) => (
                    <SelectItem
                      key={reasonOption.value}
                      value={reasonOption.value}
                    >
                      {reasonOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {reason === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="customReason">Please specify</Label>
                  <Textarea
                    id="customReason"
                    placeholder="Enter the reason for cancellation..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Refund Section */}
            {policy.refundEligible && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Refund Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                  <div className="space-y-2">
                    <Label htmlFor="refundAmount">Refund Amount</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">$</span>
                      <input
                        type="number"
                        id="refundAmount"
                        min="0"
                        max={policy.maxRefund / 100}
                        step="0.01"
                        value={refundAmount / 100}
                        onChange={(e) =>
                          setRefundAmount(
                            Math.round(parseFloat(e.target.value ?? "0") * 100),
                          )
                        }
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRefundAmount(policy.maxRefund)}
                      >
                        Max
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Maximum refund: ${formatPrice(policy.maxRefund)}
                    </p>
                  </div>

                  {refundAmount > 0 && (
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Refund Summary:</strong> $
                        {formatPrice(refundAmount)} will be refunded to the
                        customer&apos;s original payment method.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Customer Notification */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyCustomer"
                  checked={notifyCustomer}
                  onCheckedChange={(checked) =>
                    setNotifyCustomer(checked as boolean)
                  }
                />
                <Label htmlFor="notifyCustomer" className="flex items-center">
                  <Mail className="mr-1 h-4 w-4" />
                  Notify customer via email
                </Label>
              </div>
              <p className="ml-6 text-xs text-gray-500">
                The customer will receive an email notification about the
                cancellation
                {refundAmount > 0 && " and refund information"}.
              </p>
            </div>

            {/* Warning */}
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Important</h4>
                  <p className="mt-1 text-sm text-red-700">
                    This action cannot be undone. The appointment will be
                    permanently cancelled and the time slot will become
                    available for other bookings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!isFormValid || loading}
            >
              {loading ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <p>
                <strong>Customer:</strong> {booking.customerName}
              </p>
              <p>
                <strong>Service:</strong> {booking.service.name}
              </p>
              <p>
                <strong>Date:</strong> {formatDate(booking.appointmentDate)} at{" "}
                {formatTime(booking.startTime)}
              </p>
              {refundAmount > 0 && (
                <p>
                  <strong>Refund:</strong> ${formatPrice(refundAmount)}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
