"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FormField } from "@/components/ui/form-field";
import { ServiceCard } from "@/components/application/booking/service-card";
import { Calendar } from "@/components/application/booking/calendar";
import { TimeSlotGrid } from "@/components/application/booking/time-slot-grid";
import { CustomerForm } from "@/components/application/booking/customer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAriaLiveRegion } from "@/lib/accessibility";
import { ColorContrastUtils } from "@/lib/accessibility";

// Mock data for testing
const mockService = {
  id: "1",
  name: "Haircut & Style",
  description: "Professional haircut with styling",
  duration: 60,
  price: 5000, // $50.00 in cents
  category: "Hair Services",
  bufferTime: 15,
};

const mockTimeSlots = [
  { date: "2024-01-15", startTime: "09:00", endTime: "10:00", available: true },
  { date: "2024-01-15", startTime: "10:00", endTime: "11:00", available: true },
  {
    date: "2024-01-15",
    startTime: "11:00",
    endTime: "12:00",
    available: false,
  },
  { date: "2024-01-15", startTime: "14:00", endTime: "15:00", available: true },
];

export function AccessibilityTest() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { announce, LiveRegion } = useAriaLiveRegion();

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    announce(`Selected service: ${mockService.name}`);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    announce(`Selected date: ${new Date(date).toLocaleDateString()}`);
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    setSelectedTime(startTime);
    announce(`Selected time: ${startTime}`);
  };

  const handleFormSubmit = async (data: any) => {
    console.log("Form submitted:", data);
    announce("Booking confirmed successfully");
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.phone) errors.phone = "Phone is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Test color contrast
  const testColorContrast = () => {
    const primaryColor = "#6d5cff";
    const backgroundColor = "#ffffff";
    const ratio = ColorContrastUtils.getContrastRatio(
      primaryColor,
      backgroundColor,
    );
    const meetsAA = ColorContrastUtils.meetsWCAGAA(
      primaryColor,
      backgroundColor,
    );
    const meetsAAA = ColorContrastUtils.meetsWCAGAAA(
      primaryColor,
      backgroundColor,
    );

    announce(
      `Color contrast ratio: ${ratio.toFixed(2)}, WCAG AA: ${meetsAA ? "Pass" : "Fail"}, WCAG AAA: ${meetsAAA ? "Pass" : "Fail"}`,
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* <LiveRegion /> */}

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Testing Dashboard</CardTitle>
          <p className="text-sm text-gray-600">
            Test keyboard navigation, screen reader support, and ARIA attributes
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button Tests */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">Button Accessibility</h3>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="default"
                aria-label="Primary action button"
                onClick={() => announce("Primary button clicked")}
              >
                Primary Button
              </Button>
              <Button
                variant="secondary"
                aria-pressed={selectedService === "1"}
                onClick={() => handleServiceSelect("1")}
              >
                Toggle Button
              </Button>
              <Button
                variant="outline"
                disabled
                aria-label="Disabled button example"
              >
                Disabled Button
              </Button>
              <Button
                variant="ghost"
                aria-expanded={dialogOpen}
                aria-controls="test-dialog"
                onClick={() => setDialogOpen(true)}
              >
                Open Dialog
              </Button>
            </div>
          </section>

          {/* Form Field Tests */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Form Field Accessibility
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Full Name"
                required
                error={formErrors.name}
                helperText="Enter your first and last name"
              >
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="John Doe"
                />
              </FormField>

              <FormField
                label="Email Address"
                required
                error={formErrors.email}
                helperText="We'll send confirmation to this email"
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="john@example.com"
                />
              </FormField>
            </div>

            <Button
              className="mt-4"
              onClick={validateForm}
              aria-describedby="form-validation-help"
            >
              Validate Form
            </Button>
            <p id="form-validation-help" className="mt-2 text-sm text-gray-600">
              Click to test form validation and error announcements
            </p>
          </section>

          {/* Service Card Test */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Service Card Accessibility
            </h3>
            <ServiceCard
              service={mockService}
              isSelected={selectedService === mockService.id}
              onSelect={handleServiceSelect}
            />
          </section>

          {/* Calendar Test */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Calendar Accessibility
            </h3>
            <div className="max-w-md">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                availableDates={["2024-01-15", "2024-01-16", "2024-01-17"]}
              />
            </div>
          </section>

          {/* Time Slot Grid Test */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Time Slot Grid Accessibility
            </h3>
            <div className="max-w-md">
              <TimeSlotGrid
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                timeSlots={mockTimeSlots}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          </section>

          {/* Dialog Test */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">Dialog Accessibility</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Open Test Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Accessible Dialog Example</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    This dialog demonstrates proper focus management and
                    keyboard navigation.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => announce("Action performed")}>
                      Perform Action
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </section>

          {/* Drawer Test */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Drawer Navigation Accessibility
            </h3>
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline">Open Navigation Drawer</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Navigation Menu</DrawerTitle>
                </DrawerHeader>
                {/* <DrawerNav>
                  <DrawerNavItem href="#" active>
                    Dashboard
                  </DrawerNavItem>
                  <DrawerNavItem href="#">Bookings</DrawerNavItem>
                  <DrawerNavItem href="#">Services</DrawerNavItem>
                  <DrawerNavItem href="#">Settings</DrawerNavItem>
                </DrawerNav> */}
              </DrawerContent>
            </Drawer>
          </section>

          {/* Customer Form Test */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Customer Form Accessibility
            </h3>
            <div className="max-w-md">
              <CustomerForm
                onSubmit={handleFormSubmit}
                initialData={{ name: "", email: "", phone: "" }}
              />
            </div>
          </section>

          {/* Color Contrast Test */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Color Contrast Testing
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary flex h-16 w-16 items-center justify-center rounded font-bold text-white">
                  Aa
                </div>
                <div>
                  <p className="font-medium">Primary Color on White</p>
                  <Button onClick={testColorContrast} size="sm">
                    Test Contrast Ratio
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded border border-green-300 bg-green-100 p-4">
                  <Badge variant="outline" className="bg-green-600 text-white">
                    WCAG AA Compliant
                  </Badge>
                  <p className="mt-2 text-sm">Contrast ratio ≥ 4.5:1</p>
                </div>
                <div className="rounded border border-blue-300 bg-blue-100 p-4">
                  <Badge variant="outline" className="bg-blue-700 text-white">
                    WCAG AAA Compliant
                  </Badge>
                  <p className="mt-2 text-sm">Contrast ratio ≥ 7:1</p>
                </div>
              </div>
            </div>
          </section>

          {/* Keyboard Navigation Instructions */}
          <section>
            <h3 className="mb-4 text-lg font-semibold">
              Keyboard Navigation Guide
            </h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <ul className="space-y-2 text-sm">
                <li>
                  <kbd className="rounded bg-gray-200 px-2 py-1">Tab</kbd> -
                  Navigate between interactive elements
                </li>
                <li>
                  <kbd className="rounded bg-gray-200 px-2 py-1">
                    Shift + Tab
                  </kbd>{" "}
                  - Navigate backwards
                </li>
                <li>
                  <kbd className="rounded bg-gray-200 px-2 py-1">Enter</kbd> -
                  Activate buttons and links
                </li>
                <li>
                  <kbd className="rounded bg-gray-200 px-2 py-1">Space</kbd> -
                  Activate buttons and checkboxes
                </li>
                <li>
                  <kbd className="rounded bg-gray-200 px-2 py-1">Escape</kbd> -
                  Close dialogs and menus
                </li>
                <li>
                  <kbd className="rounded bg-gray-200 px-2 py-1">
                    Arrow Keys
                  </kbd>{" "}
                  - Navigate within grids and menus
                </li>
              </ul>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
