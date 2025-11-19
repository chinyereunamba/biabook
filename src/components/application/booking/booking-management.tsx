"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Settings,
} from "lucide-react";
import { type AppointmentWithDetails } from "@/types/booking";
import { BookingList } from "./booking-list";
import { BookingDetails } from "./booking-details";
import { BookingStatusUpdate } from "./booking-status-update";
import { BookingCancellation } from "./booking-cancellation";
import { BookingReschedule } from "./booking-reschedule";
import {
  ErrorDisplay,
  useErrorHandler,
  type ErrorInfo,
} from "@/components/base/error-display";
import { useApiErrorHandler } from "@/utils/error-transformation";
import { toast } from "sonner";

interface BookingManagementProps {
  businessId: string;
}

interface BookingStats {
  today: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  thisWeek: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  thisMonth: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

export function BookingManagement({ businessId }: BookingManagementProps) {
  const [selectedBooking, setSelectedBooking] =
    useState<AppointmentWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Error handling
  const { error, handleError, retry, clearError } = useErrorHandler();
  const { handleApiError } = useApiErrorHandler();

  // Mock stats - in a real app, this would come from an API
  const mockStats: BookingStats = {
    today: { total: 8, confirmed: 5, pending: 2, completed: 1, cancelled: 0 },
    thisWeek: {
      total: 45,
      confirmed: 32,
      pending: 8,
      completed: 4,
      cancelled: 1,
    },
    thisMonth: {
      total: 180,
      confirmed: 145,
      pending: 20,
      completed: 12,
      cancelled: 3,
    },
  };

  const handleViewBooking = (booking: AppointmentWithDetails) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleEditBooking = (booking: AppointmentWithDetails) => {
    setSelectedBooking(booking);
    setShowStatusUpdate(true);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete booking");
      }

      toast.success("Booking deleted successfully");
      // Refresh the booking list
      window.location.reload();
    } catch (error) {
      const errorInfo = handleApiError(error, {
        action: "delete_booking",
        bookingId,
      });
      handleError(errorInfo);
      toast.error("Failed to delete booking. Please try again.");
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }

      toast.success("Booking status updated successfully");
      // Refresh the booking list
      window.location.reload();
    } catch (error) {
      const errorInfo = handleApiError(error, {
        action: "update_status",
        bookingId,
        status,
      });
      handleError(errorInfo);
      toast.error("Failed to update booking status. Please try again.");
    }
  };

  const handleStatusUpdateWithNotes = async (
    bookingId: string,
    status: string,
    notes?: string,
  ) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }

      setShowStatusUpdate(false);
      setSelectedBooking(null);
      toast.success("Booking status updated successfully");
      // Refresh the booking list
      window.location.reload();
    } catch (error) {
      const errorInfo = handleApiError(error, {
        action: "update_status_with_notes",
        bookingId,
        status,
        notes,
      });
      handleError(errorInfo);
      toast.error("Failed to update booking status. Please try again.");
    }
  };

  const handleCancelBooking = async (
    bookingId: string,
    reason: string,
    notifyCustomer: boolean,
    refundAmount?: number,
  ) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
          notes: `Cancelled: ${reason}${refundAmount ? ` (Refund: $${(refundAmount / 100).toFixed(2)})` : ""}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      setShowCancellation(false);
      setSelectedBooking(null);
      toast.success("Booking cancelled successfully");
      // Refresh the booking list
      window.location.reload();
    } catch (error) {
      const errorInfo = handleApiError(error, {
        action: "cancel_booking",
        bookingId,
        reason,
        notifyCustomer,
        refundAmount,
      });
      handleError(errorInfo);
      toast.error("Failed to cancel booking. Please try again.");
    }
  };

  const handleRescheduleBooking = async (
    bookingId: string,
    newDate: string,
    newTime: string,
    notes?: string,
    notifyCustomer?: boolean,
  ) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentDate: newDate,
          startTime: newTime,
          notes: notes
            ? `Rescheduled: ${notes}`
            : "Rescheduled by business owner",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reschedule booking");
      }

      setShowReschedule(false);
      setSelectedBooking(null);
      toast.success("Booking rescheduled successfully");
      // Refresh the booking list
      window.location.reload();
    } catch (error) {
      const errorInfo = handleApiError(error, {
        action: "reschedule_booking",
        bookingId,
        newDate,
        newTime,
        notes,
        notifyCustomer,
      });
      handleError(errorInfo);
      toast.error("Failed to reschedule booking. Please try again.");
    }
  };

  const closeAllDialogs = () => {
    setShowDetails(false);
    setShowStatusUpdate(false);
    setShowCancellation(false);
    setShowReschedule(false);
    setSelectedBooking(null);
  };

  const getStatusFilter = () => {
    switch (activeTab) {
      case "pending":
        return "pending";
      case "confirmed":
        return "confirmed";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={retry}
          onDismiss={clearError}
          variant="inline"
          showDetails={true}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Booking Management
          </h1>
          <p className="text-gray-600">Manage your appointments and bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Bookings
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.today.total}</div>
            <p className="text-muted-foreground text-xs">
              {mockStats.today.confirmed} confirmed, {mockStats.today.pending}{" "}
              pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.thisWeek.total}</div>
            <p className="text-muted-foreground text-xs">
              {mockStats.thisWeek.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.thisMonth.total}
            </div>
            <p className="text-muted-foreground text-xs">
              {mockStats.thisMonth.cancelled} cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (mockStats.thisMonth.completed / mockStats.thisMonth.total) *
                  100,
              )}
              %
            </div>
            <p className="text-muted-foreground text-xs">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <BookingList
            businessId={businessId}
            onViewBooking={handleViewBooking}
            onEditBooking={handleEditBooking}
            onDeleteBooking={handleDeleteBooking}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedBooking && showDetails && (
        <BookingDetails
          booking={selectedBooking}
          onEdit={() => {
            setShowDetails(false);
            setShowStatusUpdate(true);
          }}
          onUpdateStatus={(status) =>
            handleUpdateStatus(selectedBooking.id, status)
          }
          onCancel={() => {
            setShowDetails(false);
            setShowCancellation(true);
          }}
          onClose={closeAllDialogs}
        />
      )}

      {selectedBooking && showStatusUpdate && (
        <BookingStatusUpdate
          booking={selectedBooking}
          onStatusUpdate={handleStatusUpdateWithNotes}
          onClose={closeAllDialogs}
          isOpen={showStatusUpdate}
        />
      )}

      {selectedBooking && showCancellation && (
        <BookingCancellation
          booking={selectedBooking}
          onCancel={handleCancelBooking}
          onClose={closeAllDialogs}
          isOpen={showCancellation}
        />
      )}

      {selectedBooking && showReschedule && (
        <BookingReschedule
          booking={selectedBooking}
          onReschedule={handleRescheduleBooking}
          onClose={closeAllDialogs}
          isOpen={showReschedule}
        />
      )}
    </div>
  );
}
