"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { BusinessProfileComponent, type BusinessProfile } from "@/components/application/booking/business-profile";
import { Calendar } from "@/components/application/booking/calendar";
import { TimeSlotGrid, type TimeSlot } from "@/components/application/booking/time-slot-grid";
import { CustomerForm, type CustomerFormData } from "@/components/application/booking/customer-form";
import { BookingConfirmation, type BookingConfirmationData } from "@/components/application/booking/booking-confirmation";

export default function BookingPage() {
  const params = useParams();
  const businessId = params.slug as string;

  // State management
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Availability state
  const [availabilityData, setAvailabilityData] = useState<{
    availability: Array<{
      date: string;
      dayOfWeek: number;
      slots: TimeSlot[];
    }>;
  } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/businesses/${businessId}`);

        if (!response.ok) {
          throw new Error("Business not found");
        }

        const businessData = await response.json();
        setBusiness(businessData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load business");
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  // Fetch availability data
  const fetchAvailability = async (serviceId: string) => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError(null);

      const params = new URLSearchParams({
        serviceId,
        days: "30", // Get 30 days of availability
      });

      const response = await fetch(`/api/businesses/${businessId}/availability?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await response.json();
      setAvailabilityData(data);
    } catch (err) {
      setAvailabilityError(err instanceof Error ? err.message : "Failed to load availability");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Real-time availability checking
  const checkSlotAvailability = async (date: string, startTime: string, endTime: string) => {
    try {
      const params = new URLSearchParams({
        serviceId: selectedServiceId,
        date,
        startTime,
        endTime,
      });

      const response = await fetch(`/api/businesses/${businessId}/availability/check?${params}`);

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.available;
    } catch (err) {
      console.error("Error checking slot availability:", err);
      return false;
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate(""); // Reset date selection
    setSelectedTime(""); // Reset time selection
    setStep(2);
    // Fetch availability for the selected service
    fetchAvailability(serviceId);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time selection when date changes
  };

  const handleTimeSelect = async (startTime: string, endTime: string) => {
    // Check real-time availability before allowing selection
    const isAvailable = await checkSlotAvailability(selectedDate, startTime, endTime);

    if (isAvailable) {
      setSelectedTime(startTime);
    } else {
      // Refresh availability data if slot is no longer available
      if (selectedServiceId) {
        fetchAvailability(selectedServiceId);
      }
      alert("This time slot is no longer available. Please select another time.");
    }
  };

  const handleDateTimeConfirm = async () => {
    if (selectedDate && selectedTime) {
      // Final availability check before proceeding
      const selectedSlot = availabilityData?.availability
        .find(day => day.date === selectedDate)?.slots
        .find(slot => slot.startTime === selectedTime);

      if (selectedSlot) {
        const isStillAvailable = await checkSlotAvailability(
          selectedDate,
          selectedSlot.startTime,
          selectedSlot.endTime
        );

        if (isStillAvailable) {
          setStep(3);
        } else {
          // Refresh availability and show error
          if (selectedServiceId) {
            fetchAvailability(selectedServiceId);
          }
          alert("This time slot is no longer available. Please select another time.");
          setSelectedTime("");
        }
      }
    }
  };

  // Auto-refresh availability every 30 seconds when on step 2
  useEffect(() => {
    if (step === 2 && selectedServiceId) {
      const interval = setInterval(() => {
        fetchAvailability(selectedServiceId);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [step, selectedServiceId, businessId]);

  const handleBookingSubmit = async (customerData: CustomerFormData) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setBookingError("Missing booking information");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      // Calculate end time based on service duration
      const timeParts = selectedTime.split(':');
      const startHours = parseInt(timeParts[0] || '0', 10);
      const startMinutes = parseInt(timeParts[1] || '0', 10);

      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const bookingData = {
        businessId,
        serviceId: selectedService.id,
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        endTime,
        notes: customerData.notes,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      // Set booking result and move to confirmation step
      setBookingResult(result.appointment);
      setStep(4);
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedService = business?.services.find(s => s.id === selectedServiceId);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Business Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The business you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Business Profile Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <BusinessProfileComponent
                    business={business}
                    selectedServiceId={selectedServiceId}
                    onServiceSelect={handleServiceSelect}
                  />
                </div>
              </div>

              {/* Service Selection Main Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose a Service</CardTitle>
                    <p className="text-sm text-gray-600">
                      Select the service you'd like to book with {business.name}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {business.services.map((service) => (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${selectedServiceId === service.id
                            ? "ring-2 ring-purple-500 border-purple-500"
                            : "hover:border-purple-300"
                            }`}
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                  {service.name}
                                </h3>
                                {service.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {service.description}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{service.duration} minutes</span>
                                  <span>•</span>
                                  <span>${(service.price / 100).toFixed(2)}</span>
                                </div>
                              </div>
                              <Button
                                size={'sm'}
                                variant={selectedServiceId === service.id ? "primary" : "outline"}
                              >
                                {selectedServiceId === service.id ? "Selected" : "Select"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
                        <p className="text-sm text-gray-600">{business.category.name}</p>
                      </div>

                      {selectedService && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Selected Service</h4>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="font-medium">{selectedService.name}</p>
                            <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
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
                          <h4 className="font-semibold mb-2">Selected Time</h4>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="font-medium">{selectedDate}</p>
                            <p className="text-sm text-gray-600">{selectedTime}</p>
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
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating availability...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => selectedServiceId && fetchAvailability(selectedServiceId)}
                        disabled={availabilityLoading}
                      >
                        <Loader2 className={`h-4 w-4 mr-2 ${availabilityLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button variant="outline" size={'sm'} onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Services
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Calendar
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      availableDates={
                        availabilityData?.availability
                          .filter(day => day.slots.length > 0)
                          .map(day => day.date) || []
                      }
                    />

                    <TimeSlotGrid
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      timeSlots={
                        availabilityData?.availability
                          .find(day => day.date === selectedDate)?.slots || []
                      }
                      onTimeSelect={handleTimeSelect}
                      loading={availabilityLoading}
                    />
                  </div>

                  {availabilityError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">
                        Error loading availability: {availabilityError}
                      </p>
                      <button
                        onClick={() => selectedServiceId && fetchAvailability(selectedServiceId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {!availabilityLoading && !availabilityError && availabilityData &&
                    availabilityData.availability.every(day => day.slots.length === 0) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          No availability found for the selected service in the next 30 days.
                          Please try selecting a different service or contact the business directly.
                        </p>
                      </div>
                    )}

                  {selectedDate && selectedTime && (
                    <div className="text-center">
                      <Button size="md" onClick={handleDateTimeConfirm}>
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
                    <h3 className="font-semibold mb-4">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Business:</span>
                        <span className="font-medium">{business.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedService?.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date & Time:</span>
                        <span>{selectedDate} at {selectedTime}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3 font-semibold">
                        <span>Total:</span>
                        <span>${selectedService ? (selectedService.price / 100).toFixed(2) : '0.00'}</span>
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
                    <Button variant="outline" size={'sm'} onClick={() => setStep(2)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Date & Time
                    </Button>
                  </div>

                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{bookingError}</p>
                    </div>
                  )}

                  <CustomerForm
                    initialData={customerInfo}
                    onSubmit={handleBookingSubmit}
                    loading={bookingLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && bookingResult && (
            <BookingConfirmation
              booking={{
                id: bookingResult.id,
                confirmationNumber: bookingResult.confirmationNumber || bookingResult.id,
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
                  phone: business.phone || undefined,
                  email: business.email || undefined,
                  location: business.location || undefined
                },
                service: {
                  id: selectedService!.id,
                  name: selectedService!.name,
                  duration: selectedService!.duration,
                  price: selectedService!.price
                }
              }}
              onNewBooking={() => {
                // Reset form and go back to step 1
                setStep(1);
                setSelectedServiceId("");
                setSelectedDate("");
                setSelectedTime("");
                setCustomerInfo({ name: "", email: "", phone: "", notes: "" });
                setBookingResult(null);
                setBookingError(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}