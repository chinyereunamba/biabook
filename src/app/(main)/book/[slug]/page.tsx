"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, MapPin } from "lucide-react";
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
import { BookingStepper } from "@/components/application/booking/booking-stepper";
import type { CustomerFormData } from "@/components/application/booking/customer-form";
import type { BookingConfirmationData } from "@/components/application/booking/booking-confirmation";
import { useGetBusiness } from "@/hooks/use-business";
import { useAvailability } from "@/hooks/use-availability";
import { useBooking, createBookingRequest } from "@/hooks/use-booking";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Service", description: "Select treatment" },
  { id: 2, title: "Schedule", description: "Pick date & time" },
  { id: 3, title: "Details", description: "Your information" },
  { id: 4, title: "Confirm", description: "Booking complete" },
];

export default function BookingPage() {
  const params = useParams();
  const businessId = params.slug as string;

  const { business, loading, error } = useGetBusiness(businessId);
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
  const [bookingResult, setBookingResult] = useState<BookingConfirmationData | null>(null);

  const {
    availabilityData,
    loading: availabilityLoading,
    error: availabilityError,
    fetchAvailability,
    checkSlotAvailability,
    refreshAvailability,
  } = useAvailability({
    businessId,
    serviceId: selectedServiceId,
    autoRefreshInterval: step === 2 ? 30000 : 0,
  });

  const {
    submitBooking,
    loading: bookingLoading,
    error: bookingError,
    clearError: clearBookingError,
  } = useBooking({
    onSuccess: (appointment) => {
      setBookingResult(appointment);
      setStep(4);
      toast.success("Booking confirmed!");
    },
    onError: (error) => {
      toast.error("Booking failed", { description: error.message || "Please try again" });
    },
  });

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate("");
    setSelectedTime("");
    setStep(2);
    void fetchAvailability(serviceId);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    setSelectedTime(startTime);
  };

  const handleDateTimeConfirm = async () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const selectedService = useMemo(() =>
    business?.services.find((s) => s.id === selectedServiceId),
    [business, selectedServiceId]
  );

  const handleBookingSubmit = async (customerData: CustomerFormData) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const bookingRequest = createBookingRequest(
      businessId,
      selectedService.id,
      customerData,
      selectedDate,
      selectedTime,
      selectedService.duration,
    );

    await submitBooking(bookingRequest);
  };

  if (loading) return <LoadingOverlay message="Loading studio..." transparent={false} />;

  if (error ?? !business) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorFeedback
          title="Business Not Found"
          message={error ?? "We couldn't find the studio you're looking for."}
          action={<Link href="/" className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold text-xs uppercase tracking-widest">Back to Discover</Link>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Stepper Overlay */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-container">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-8">
            <div className="hidden lg:block">
              <Link href={`/business/${businessId}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Studio</p>
                  <p className="text-sm font-bold text-primary">{business.name}</p>
                </div>
              </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-auto">
              <BookingStepper steps={STEPS.map(s => s.title)} currentStep={step} className="w-full" />
            </div>

            <div className="hidden lg:block w-[140px]" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {step < 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Sidebar Info */}
              <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
                <LazyBusinessProfile business={business} />

                {/* Booking Summary Widget */}
                {selectedService && (
                  <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Appointment Summary</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-xs font-black font-display flex-shrink-0">
                          {selectedService.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary leading-tight">{selectedService.name}</p>
                          <p className="text-[10px] text-on-surface-variant/60 font-sans mt-0.5">{selectedService.duration} Minutes</p>
                        </div>
                      </div>

                      {selectedDate && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="flex items-center gap-3 text-primary">
                            <ChevronRight className="w-4 h-4 opacity-20" />
                            <span className="text-sm font-bold truncate">
                              {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                              {selectedTime && ` at ${selectedTime}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-surface-container flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Investment</span>
                      <span className="text-xl font-display font-bold text-primary">₦{(selectedService.price / 100).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-8">
                <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {step === 1 && (
                    <div className="space-y-12">
                      <div className="space-y-4">
                        <h2 className="text-5xl font-display font-black text-primary tracking-tight leading-tight">Selecting your<br />experience</h2>
                        <p className="text-on-surface-variant/60 max-w-md font-sans text-lg">Every treatment is crafted to provide exactly what you need. Select the service that calls to you.</p>
                      </div>
                      <LazyServiceGrid
                        services={business.services}
                        selectedServiceId={selectedServiceId}
                        onServiceSelect={handleServiceSelect}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-10">
                      <div className="flex items-end justify-between gap-4">
                        <div className="space-y-4">
                          <h2 className="text-5xl font-display font-black text-primary tracking-tight leading-tight">Find your<br />moment</h2>
                          <p className="text-on-surface-variant/60 max-w-md font-sans text-lg">Review the studio details and find a time that allows you to fully arrive.</p>
                        </div>
                        <button
                          onClick={() => setStep(1)}
                          className="px-6 py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[10px] uppercase tracking-widest transition-all mb-2"
                        >
                          Change Service
                        </button>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
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
                        />
                      </div>

                      {selectedDate && selectedTime && (
                        <div className="flex justify-center pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                          <button
                            onClick={handleDateTimeConfirm}
                            className="px-12 py-5 rounded-full bg-primary text-on-primary font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                          >
                            Proceed to Details
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-12">
                      <div className="flex items-end justify-between gap-4">
                        <div className="space-y-4">
                          <h2 className="text-5xl font-display font-black text-primary tracking-tight leading-tight">Finalizing<br />your visit</h2>
                          <p className="text-on-surface-variant/60 max-w-md font-sans text-lg">We just need a few more details to prepare the studio for your arrival.</p>
                        </div>
                        <button
                          onClick={() => setStep(2)}
                          className="px-6 py-3 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[10px] uppercase tracking-widest transition-all mb-2"
                        >
                          Back to Schedule
                        </button>
                      </div>

                      <LazyCustomerForm
                        initialData={customerInfo}
                        onSubmit={handleBookingSubmit}
                        loading={bookingLoading}
                        error={bookingError?.message ?? null}
                        onErrorClear={clearBookingError}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && bookingResult && (
            <div className="animate-in fade-in zoom-in-95 duration-1000">
              <LazyBookingConfirmation
                booking={{
                  id: bookingResult.id,
                  confirmationNumber: bookingResult.confirmationNumber ?? bookingResult.id,
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
                  },
                  service: {
                    id: selectedService!.id,
                    name: selectedService!.name,
                    duration: selectedService!.duration,
                    price: selectedService!.price,
                  },
                }}
                onNewBooking={() => {
                  setStep(1);
                  setSelectedServiceId("");
                  setSelectedDate("");
                  setSelectedTime("");
                  setCustomerInfo({ name: "", email: "", phone: "", notes: "" });
                  setBookingResult(null);
                  clearBookingError();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
