"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Star,
  User,
  Mail,
  Phone,
  CheckCircle,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function BookingPage() {
  const params = useParams();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Mock business data
  const business = {
    name: "Bella Hair Salon",
    category: "Hair Salon",
    rating: 4.8,
    reviews: 124,
    address: "123 Main St, City, State",
    phone: "+1 234-567-8900",
    description:
      "Professional hair salon offering premium cuts, colors, and styling services in a relaxing environment.",
  };

  const services = [
    {
      id: 1,
      name: "Hair Cut & Style",
      duration: 45,
      price: 50,
      description: "Professional cut and styling",
    },
    {
      id: 2,
      name: "Hair Color",
      duration: 120,
      price: 120,
      description: "Full color treatment with consultation",
    },
    {
      id: 3,
      name: "Beard Trim",
      duration: 30,
      price: 25,
      description: "Precision beard trimming and shaping",
    },
    {
      id: 4,
      name: "Hair Wash & Blowdry",
      duration: 30,
      price: 35,
      description: "Relaxing wash and professional blowdry",
    },
  ];

  const availableTimes = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
  ];

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
    // Here you would typically send the booking data to your backend
    // and trigger WhatsApp notification
  };

  const selectedServiceData = services.find((s) => s.id === selectedService);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className=" bg-white mt-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <span className="text-lg font-bold text-purple-600">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{business.name}</h1>
                <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                  <Badge variant="secondary">{business.category}</Badge>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {business.rating} ({business.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Business Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold">About</h3>
                    <p className="text-muted-foreground text-sm">
                      {business.description}
                    </p>
                  </div>

                  <div className="flex items-center text-sm">
                    <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                    <span>{business.address}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Phone className="text-muted-foreground mr-2 h-4 w-4" />
                    <span>{business.phone}</span>
                  </div>

                  {step > 1 && selectedServiceData && (
                    <div className="border-t pt-4">
                      <h4 className="mb-2 font-semibold">Selected Service</h4>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <p className="font-medium">
                          {selectedServiceData.name}
                        </p>
                        <div className="text-muted-foreground mt-1 flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {selectedServiceData.duration} min
                          </span>
                          <span className="text-foreground font-semibold">
                            ${selectedServiceData.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {step > 2 && selectedDate && selectedTime && (
                    <div className="border-t pt-4">
                      <h4 className="mb-2 font-semibold">Selected Time</h4>
                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="font-medium">{selectedDate}</p>
                        <p className="text-muted-foreground text-sm">
                          {selectedTime}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div>
                <h2 className="mb-6 text-2xl font-bold">Choose a Service</h2>
                <div className="grid gap-4">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                    >
                      <CardContent
                        className="p-6"
                        onClick={() => handleServiceSelect(service.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {service.name}
                            </h3>
                            <p className="text-muted-foreground mb-2 text-sm">
                              {service.description}
                            </p>
                            <div className="text-muted-foreground flex items-center text-sm">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{service.duration} minutes</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              ${service.price}
                            </p>
                            <Button>Select</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Select Date & Time</h2>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back to Services
                  </Button>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Choose Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid grid-cols-7 gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div
                              key={day}
                              className="p-2 text-center text-sm font-medium"
                            >
                              {day}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + i - 7);
                          const dateStr = date.toISOString().split("T")[0];
                          const isToday = i === 7;
                          const isPast = i < 7;

                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedDate(dateStr)}
                              disabled={isPast}
                              className={`rounded-md p-2 text-sm transition-colors ${
                                selectedDate === dateStr
                                  ? "bg-purple-600 text-white"
                                  : isPast
                                    ? "text-muted-foreground cursor-not-allowed"
                                    : "hover:bg-purple-100"
                              } ${isToday ? "ring-2 ring-purple-200" : ""}`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Available Times</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedDate ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availableTimes.map((time) => (
                            <Button
                              key={time}
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className="justify-center"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground py-8 text-center">
                          Please select a date first
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {selectedDate && selectedTime && (
                  <div className="mt-6 text-center">
                    <Button size="lg" onClick={handleDateTimeSelect}>
                      Continue to Booking Details
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Your Information</h2>
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back to Date & Time
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
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
                          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
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
                          <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
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

                      <div className="bg-muted rounded-lg p-4">
                        <h4 className="mb-2 font-semibold">Booking Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <span>{selectedServiceData?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{selectedServiceData?.duration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Date & Time:</span>
                            <span>
                              {selectedDate} at {selectedTime}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 font-semibold">
                            <span>Total:</span>
                            <span>${selectedServiceData?.price}</span>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Confirm Booking
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mb-4 text-3xl font-bold">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  Your appointment has been successfully booked.
                </p>

                <Card className="mx-auto max-w-md">
                  <CardContent className="p-6">
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service:</span>
                        <span className="font-medium">
                          {selectedServiceData?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Date & Time:
                        </span>
                        <span className="font-medium">
                          {selectedDate} at {selectedTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{customerInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">
                          {customerInfo.phone}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="text-lg font-bold">
                          ${selectedServiceData?.price}
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

                  <p className="text-muted-foreground text-sm">
                    You will receive a confirmation message on WhatsApp shortly.
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
    </div>
  );
}
