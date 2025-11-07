"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import {
  Calendar,
  Building,
  Phone,
  Globe,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const BUSINESS_CATEGORIES = [
  "Hair Salon",
  "Barbershop",
  "Spa & Wellness",
  "Fitness",
  "Healthcare",
  "Education",
  "Photography",
  "Consulting",
  "Home Services",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [businessData, setBusinessData] = useState({
    name: "",
    category: "",
    description: "",
    phone: "",
    website: "",
  });

  // Use address autocomplete hook
  const {
    addressState,
    handleAddressSelect,
    handleAddressChange,
    setCity,
    setState,
    setZipCode,
    hasCompleteAddress,
    validationErrors,
  } = useAddressAutocomplete({
    onAddressChange: (address) => {
      // Address state is managed by the hook
    },
    validateOnChange: true,
    showSuccessToast: true,
  });
  const [services, setServices] = useState([
    { name: "", duration: "", price: "" },
  ]);
  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "17:00" },
    sunday: { enabled: false, start: "09:00", end: "17:00" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Auth and onboarding checks are now handled by the layout

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const categories = BUSINESS_CATEGORIES;

  const addService = () => {
    setServices([...services, { name: "", duration: "", price: "" }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: string) => {
    const updated = services.map((service, i) =>
      i === index ? { ...service, [field]: value } : service,
    );
    setServices(updated);
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      try {
        setIsSubmitting(true);
        setError("");

        // Validate required fields
        if (!businessData.name || !businessData.category) {
          setError("Business name and category are required");
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        if (!services.some((s) => s.name && s.duration && s.price)) {
          setError(
            "At least one service with name, duration and price is required",
          );
          setStep(2);
          setIsSubmitting(false);
          return;
        }

        // Submit data to API
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessData: {
              ...businessData,
              ...addressState, // Include all address data
            },
            services,
            availability,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to complete onboarding");
        }

        // Get the response data
        const data = await response.json();

        // Store the business slug in localStorage for the success page
        if (data.slug) {
          try {
            localStorage.setItem("businessSlug", data.slug);
          } catch (error) {
            // Silently handle localStorage errors
            // Continue without storing in localStorage
          }
        }

        // Update the session to reflect onboarding completion
        await update();

        // Redirect to dashboard
        router.push(data.redirectUrl || "/dashboard");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const bookingUrl = `https://biabook.app/book/${businessData.name.toLowerCase().replace(/\s+/g, "-")}`;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">BiaBook</span>
          </div>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
            Setup Progress: {step}/{totalSteps}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Business Information */}
        {step === 1 && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Tell us about your business
              </CardTitle>
              <CardDescription className="text-gray-600">
                This information will be displayed on your booking page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-gray-700">
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. Bella Hair Salon"
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    value={businessData.name}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700">
                    Category *
                  </Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                    value={businessData.category}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        category: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Brief description of your business and services"
                  className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                  value={businessData.description}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500"
                      value={businessData.phone}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-gray-700">
                    Website (Optional)
                  </Label>
                  <div className="relative">
                    <Globe className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500"
                      value={businessData.website}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          website: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Business Address
                </Label>
                <AddressAutocomplete
                  id="address"
                  value={addressState.address}
                  onChange={handleAddressChange}
                  onAddressSelect={handleAddressSelect}
                  placeholder="Start typing your business address..."
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  countryRestriction="us"
                  types={["establishment", "geocode"]}
                />
                <p className="text-xs text-gray-500">
                  Start typing to see address suggestions. We'll automatically
                  fill in city, state, and ZIP code.
                </p>
                {validationErrors.length > 0 && (
                  <div className="text-sm text-red-600">
                    {validationErrors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Show parsed address components if available */}
              {(addressState.city ||
                addressState.state ||
                addressState.zipCode) && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-gray-700">City</Label>
                    <Input
                      value={addressState.city}
                      onChange={(e) => setCity(e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">State</Label>
                    <Input
                      value={addressState.state}
                      onChange={(e) => setState(e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">ZIP Code</Label>
                    <Input
                      value={addressState.zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              )}

              {/* Show coordinates if available */}
              {addressState.coordinates && (
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-sm text-green-700">
                    ✓ Location coordinates detected:{" "}
                    {addressState.coordinates.latitude.toFixed(6)},{" "}
                    {addressState.coordinates.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Add your services
              </CardTitle>
              <CardDescription className="text-gray-600">
                What services do you offer? You can always add more later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Service {index + 1}
                    </h4>
                    {services.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(index)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Service Name *</Label>
                      <Input
                        placeholder="e.g. Hair Cut & Style"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        value={service.name}
                        onChange={(e) =>
                          updateService(index, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        Duration (minutes) *
                      </Label>
                      <Input
                        type="number"
                        placeholder="45"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        value={service.duration}
                        onChange={(e) =>
                          updateService(index, "duration", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Price ($) *</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        value={service.price}
                        onChange={(e) =>
                          updateService(index, "price", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addService}
                className="w-full border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Service
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Set your availability
              </CardTitle>
              <CardDescription className="text-gray-600">
                When are you available for appointments? You can adjust this
                anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(availability).map(([day, schedule]) => (
                <div
                  key={day}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={(e) =>
                        setAvailability({
                          ...availability,
                          [day]: { ...schedule, enabled: e.target.checked },
                        })
                      }
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="w-20 font-medium text-gray-900 capitalize">
                      {day}
                    </span>
                  </div>

                  {schedule.enabled && (
                    <div className="flex items-center space-x-4">
                      <select
                        value={schedule.start}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            [day]: { ...schedule, start: e.target.value },
                          })
                        }
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-purple-500 focus:ring-purple-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <option key={`${hour}:00`} value={`${hour}:00`}>
                              {hour}:00
                            </option>
                          );
                        })}
                      </select>
                      <span className="text-gray-500">to</span>
                      <select
                        value={schedule.end}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            [day]: { ...schedule, end: e.target.value },
                          })
                        }
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-purple-500 focus:ring-purple-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <option key={`${hour}:00`} value={`${hour}:00`}>
                              {hour}:00
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                You&apos;re all set!
              </h2>
              <p className="mb-8 text-xl text-gray-600">
                Your booking page is ready. Start sharing it with your
                customers!
              </p>

              <div className="mb-8 rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Your booking page URL:
                </h3>
                <div className="flex items-center justify-center space-x-2 rounded-md border border-gray-200 bg-white p-3">
                  <span className="font-mono text-purple-600">
                    https://biabook.app/book/
                    {businessData.name.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 bg-transparent"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      "Copy"
                    )}
                  </Button>
                </div>
              </div>

              <div className="mb-8 grid gap-4 text-left md:grid-cols-2">
                <div className="rounded-lg bg-purple-50 p-4">
                  <h4 className="mb-2 font-semibold text-purple-900">
                    ✨ What&apos;s next?
                  </h4>
                  <ul className="space-y-1 text-sm text-purple-700">
                    <li>• Share your booking link</li>
                    <li>• Enable WhatsApp notifications</li>
                    <li>• Customize your page</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-semibold text-blue-900">
                    📱 Pro tip
                  </h4>
                  <p className="text-sm text-blue-700">
                    Add your booking link to your social media bio and business
                    cards for easy access!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="border-gray-300 bg-transparent text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-purple-700"
            disabled={
              isSubmitting ??
              (step === 1 && (!businessData.name || !businessData.category))
            }
          >
            {isSubmitting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                {step === totalSteps ? "Go to Dashboard" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
