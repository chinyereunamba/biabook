"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { BusinessProfileComponent, type BusinessProfile } from "@/components/application/booking/business-profile";
import { Calendar } from "@/components/application/booking/calendar";
import { TimeSlotGrid, type TimeSlot } from "@/components/application/booking/time-slot-grid";

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
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Mock time slots for now - this will be replaced with real availability data
  const mockTimeSlots: TimeSlot[] = [
    { date: selectedDate, startTime: "09:00", endTime: "09:45", available: true },
    { date: selectedDate, startTime: "10:00", endTime: "10:45", available: true },
    { date: selectedDate, startTime: "11:00", endTime: "11:45", available: true },
    { date: selectedDate, startTime: "14:00", endTime: "14:45", available: true },
    { date: selectedDate, startTime: "15:00", endTime: "15:45", available: true },
    { date: selectedDate, startTime: "16:00", endTime: "16:45", available: true },
  ];

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

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    setSelectedTime(startTime);
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
    // Here you would typically send the booking data to your backend
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
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedServiceId === service.id
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
                                variant={selectedServiceId === service.id ? "default" : "outline"}
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
                    <h2 className="text-2xl font-bold">Select Date & Time</h2>
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Services
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Calendar
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      availableDates={[]} // This will be populated with real availability data
                    />

                    <TimeSlotGrid
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      timeSlots={mockTimeSlots}
                      onTimeSelect={handleTimeSelect}
                    />
                  </div>

                  {selectedDate && selectedTime && (
                    <div className="text-center">
                      <Button size="lg" onClick={handleDateTimeConfirm}>
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
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Date & Time
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="name"
                              placeholder="Enter your full name"
                              className="pl-10"
                              value={customerInfo.name}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  name: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              value={customerInfo.email}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  email: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              className="pl-10"
                              value={customerInfo.phone}
                              onChange={(e) =>
                                setCustomerInfo({
                                  ...customerInfo,
                                  phone: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full">
                          Confirm Booking
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your appointment has been successfully booked.
              </p>

              <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business:</span>
                      <span className="font-medium">{business.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{selectedDate} at {selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{customerInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{customerInfo.phone}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-lg font-bold">
                        ${selectedService ? (selectedService.price / 100).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      WhatsApp notification sent to business owner
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  You will receive a confirmation message shortly.
                  Please arrive 5 minutes before your appointment time.
                </p>

                <Button asChild>
                  <a href="/">Book Another Appointment</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}