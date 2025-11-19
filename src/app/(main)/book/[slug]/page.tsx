"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  ErrorFeedback,
  RetryFeedback,
  WarningFeedback,
} from "@/components/ui/feedback-states";
import { LoadingOverlay, Spinner } from "@/components/ui/loading-states";
import {
  LazyBusinessProfile,
  LazyServiceGrid,
  LazyCalendar,
  LazyTimeSlotGrid,
  LazyCustomerForm,
  LazyBookingConfirmation,
} from "@/components/application/booking/lazy";
import { TimezoneBookingSummary } from "@/components/application/booking/timezone-booking-summary";
import type { CustomerFormData } from "@/components/application/booking/customer-form";
import type { BookingConfirmationData } from "@/components/application/booking/booking-confirmation";
import { useBusiness } from "@/hooks/use-business";
import { useAvailability } from "@/hooks/use-availability";
import { useBooking, createBookingRequest } from "@/hooks/use-booking";
import { toast } from "sonner";
import Link from "next/link";

export default function BookingPage() {
  const params = useParams();
  const businessId = params.slug as string;

  // Use the custom hook for business data
  const { business, loading, error } = useBusiness(businessId);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [bookingResult, setBookingResult] =
    useState<BookingConfirmationData | null>(null);

  // Use the availability hook with auto-refresh every 30 seconds when on step 2
  const {
    availabilityData,
    loading: availabilityLoading,
    error: availabilityError,
    fetchAvailability,
    checkSlotAvailability,
    refreshAvailability,
    clearError: clearAvailabilityError,
  } = useAvailability({
    businessId,
    serviceId: selectedServiceId,
    autoRefreshInterval: step === 2 ? 30000 : 0, // Auto-refresh every 30 seconds on step 2
  });

  // Use the booking hook for enhanced booking submission
  const {
    submitBooking,
    loading: bookingLoading,
    error: bookingError,
    clearError: clearBookingError,
  } = useBooking({
    onSuccess: (appointment) => {
      setBookingResult(appointment);
      setStep(4);
      // Show success toast with WhatsApp notification info
      toast.success("Booking confirmed!", {
        description: "The business owner will be notified via WhatsApp",
      });
    },
    onError: (error) => {
      // Show error toast
      toast.error("Booking failed", {
        description: error.message || "Please try again",
      });
    },
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate(""); // Reset date selection
    setSelectedTime(""); // Reset time selection
    setStep(2);
    // Fetch availability for the selected service
    void fetchAvailability(serviceId);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time selection when date changes
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    // Find the slot in current availability data
    const selectedSlot = availabilityData?.availability
      .find((day) => day.date === selectedDate)
      ?.slots.find((slot) => slot.startTime === startTime);

    // Only select if the slot is marked as available in current data
    if (selectedSlot?.available) {
      setSelectedTime(startTime);
      clearAvailabilityError();
    } else {
      // If slot is not available, refresh data and show message
      toast.error("Time slot unavailable", {
        description: "This slot is no longer available. Refreshing...",
      });
      void refreshAvailability();
    }
  };

  const handleDateTimeConfirm = async () => {
    if (selectedDate && selectedTime) {
      // Show loading state
      const loadingToast = toast.loading("Verifying availability...");

      try {
        // Final availability check before proceeding to booking form
        const selectedSlot = availabilityData?.availability
          .find((day) => day.date === selectedDate)
          ?.slots.find((slot) => slot.startTime === selectedTime);

        if (selectedSlot) {
          const isStillAvailable = await checkSlotAvailability(
            selectedDate,
            selectedSlot.startTime,
            selectedSlot.endTime,
          );

          if (isStillAvailable) {
            toast.dismiss(loadingToast);
            setStep(3);
          } else {
            toast.dismiss(loadingToast);
            toast.error("Time slot no longer available", {
              description: "Please select a different time slot",
            });
            // Refresh availability and clear selection
            await refreshAvailability();
            setSelectedTime("");
          }
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Error verifying availability", {
          description: "Please try again",
        });
      }
    }
  };

  const selectedService = business?.services.find(
    (s) => s.id === selectedServiceId,
  );

  const handleBookingSubmit = async (customerData: CustomerFormData) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      return;
    }

    // Create the booking request using the helper function
    const bookingRequest = createBookingRequest(
      businessId,
      selectedService.id,
      customerData,
      selectedDate,
      selectedTime,
      selectedService.duration,
    );

    // Submit the booking using the hook
    await submitBooking(bookingRequest);
  };

  // Loading state
  if (loading) {
    return (
      <LoadingOverlay
        message="Loading business information..."
        transparent={false}
      />
    );
  }

  // Error state
  if (error ?? !business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md">
          <ErrorFeedback
            title="Business Not Found"
            message={error ?? "The business you're looking for doesn't exist."}
            action={
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Business Profile Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <LazyBusinessProfile
                    business={business}
                    showSharing={true}
                    showContact={true}
                  />
                </div>
              </div>

              {/* Service Selection Main Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose a Service</CardTitle>
                    <p className="text-sm text-text">
                      Select the service you&apos;d like to book with{" "}
                      {business.name}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <LazyServiceGrid
                      services={business.services}
                      selectedServiceId={selectedServiceId}
                      onServiceSelect={handleServiceSelect}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Business Info Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{business.name}</h3>
                        <p className="text-sm text-text">
                          {business.category.name}
                        </p>
                      </div>

                      {selectedService && (
                        <div className="border-t pt-4">
                          <h4 className="mb-2 font-semibold">
                            Selected Service
                          </h4>
                          <div className="rounded-lg bg-primary/50 p-3">
                            <p className="font-medium">
                              {selectedService.name}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-sm text-text">
                              <span>{selectedService.duration} min</span>
                              <span className="font-semibold">
                                ${(selectedService.price / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedDate && selectedTime && (
                        <div className="border-t pt-4">
                          <h4 className="mb-2 font-semibold">Selected Time</h4>
                          <div className="rounded-lg bg-primary/50 p-3">
                            <p className="font-medium">{selectedDate}</p>
                            <p className="text-sm text-text">
                              {selectedTime}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Date & Time Selection */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-bold">Select Date & Time</h2>
                      {availabilityLoading && (
                        <div className="flex items-center space-x-2 text-sm text-text">
                          <Spinner size="sm" />
                          <span>Updating availability...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void refreshAvailability()}
                        disabled={availabilityLoading}
                      >
                        <Spinner
                          size="sm"
                          className={availabilityLoading ? "" : "opacity-0"}
                        />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size={"sm"}
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Services
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <LazyCalendar
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      availableDates={
                        availabilityData?.availability
                          .filter((day) => day.slots.length > 0)
                          .map((day) => day.date) ?? []
                      }
                    />

                    <LazyTimeSlotGrid
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      timeSlots={
                        availabilityData?.availability.find(
                          (day) => day.date === selectedDate,
                        )?.slots ?? []
                      }
                      onTimeSelect={handleTimeSelect}
                      loading={availabilityLoading}
                      error={availabilityError}
                      onRefresh={() => void refreshAvailability()}
                      businessTimezone={business.timezone}
                      businessName={business.name}
                    />
                  </div>

                  {availabilityError && (
                    <RetryFeedback
                      message={`Error loading availability: ${availabilityError}`}
                      onRetry={() => void refreshAvailability()}
                      retrying={availabilityLoading}
                    />
                  )}

                  {!availabilityLoading &&
                    !availabilityError &&
                    availabilityData &&
                    availabilityData.availability.every(
                      (day) => day.slots.length === 0,
                    ) && (
                      <WarningFeedback
                        title="No Availability Found"
                        message="No availability found for the selected service in the next 30 days. Please try selecting a different service or contact the business directly."
                      />
                    )}

                  {selectedDate && selectedTime && (
                    <div className="text-center">
                      <Button size="default" onClick={handleDateTimeConfirm}>
                        Continue to Booking Details
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Customer Information */}
          {step === 3 && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-semibold">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Business:</span>
                        <span className="font-medium">{business.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium">
                          {selectedService?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedService?.duration} minutes</span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium">
                          Date & Time:
                        </span>
                        <TimezoneBookingSummary
                          appointmentDate={selectedDate}
                          appointmentTime={selectedTime}
                          businessTimezone={business.timezone}
                          businessName={business.name}
                          compact={true}
                        />
                      </div>
                      <div className="flex justify-between border-t pt-3 font-semibold">
                        <span>Total:</span>
                        <span>
                          $
                          {selectedService
                            ? (selectedService.price / 100).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information Form */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Information</h2>
                    <Button
                      variant="outline"
                      size={"sm"}
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Date & Time
                    </Button>
                  </div>

                  <LazyCustomerForm
                    initialData={customerInfo}
                    onSubmit={handleBookingSubmit}
                    loading={bookingLoading}
                    error={bookingError?.message ?? null}
                    onErrorClear={clearBookingError}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && bookingResult && (
            <LazyBookingConfirmation
              booking={{
                id: bookingResult.id,
                confirmationNumber:
                  bookingResult.confirmationNumber ?? bookingResult.id,
                customerName: bookingResult.customerName,
                customerEmail: bookingResult.customerEmail,
                customerPhone: bookingResult.customerPhone,
                appointmentDate: bookingResult.appointmentDate,
                startTime: bookingResult.startTime,
                endTime: bookingResult.endTime,
                notes: bookingResult.notes,
                status: bookingResult.status,
                business: {
                  id: business.id,
                  name: business.name,
                  phone: business.phone ?? undefined,
                  email: business.email ?? undefined,
                  location: business.location ?? undefined,
                  timezone: business.timezone ?? undefined,
                },
                service: {
                  id: selectedService!.id,
                  name: selectedService!.name,
                  duration: selectedService!.duration,
                  price: selectedService!.price,
                },
              }}
              onNewBooking={() => {
                // Reset form and go back to step 1
                setStep(1);
                setSelectedServiceId("");
                setSelectedDate("");
                setSelectedTime("");
                setCustomerInfo({ name: "", email: "", phone: "", notes: "" });
                setBookingResult(null);
                clearBookingError();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
