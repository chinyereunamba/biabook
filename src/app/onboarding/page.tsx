"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { toast } from "sonner";

import { BusinessStep } from "@/components/application/onboarding/business-step";
import { ServicesStep } from "@/components/application/onboarding/services-step";
import { AvailabilityStep } from "@/components/application/onboarding/availability-step";
import { CompletionStep } from "@/components/application/onboarding/completion-step";

const categories = [
  { slug: "hair-salon", name: "Hair Salon" },
  { slug: "barbershop", name: "Barbershop" },
  { slug: "nail-salon", name: "Nail Salon" },
  { slug: "spa", name: "Spa & Massage" },
  { slug: "makeup", name: "Makeup Artist" },
  { slug: "fitness", name: "Fitness Trainer" },
  { slug: "medical", name: "Medical Clinic" },
  { slug: "consulting", name: "Consulting" },
  { slug: "photography", name: "Photography" },
  { slug: "cleaning", name: "Cleaning Service" },
  { slug: "tutoring", name: "Tutoring" },
  { slug: "pet-grooming", name: "Pet Grooming" },
  { slug: "other", name: "Other" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    addressState,
    validationErrors,
    handleAddressChange,
    handleAddressSelect,
    setCity,
    setState,
    setZipCode,
  } = useAddressAutocomplete();

  const [businessData, setBusinessData] = useState({
    name: "",
    category: "",
    description: "",
    phone: "",
    website: "",
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
    saturday: { enabled: false, start: "10:00", end: "15:00" },
    sunday: { enabled: false, start: "10:00", end: "15:00" },
  });

  const handleNext = async () => {
    setError("");

    if (step === 1) {
      if (!businessData.name || !businessData.category) {
        setError("Please fill in all required fields (Name and Category)");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const validServices = services.filter((s) => s.name && s.duration && s.price);
      if (validServices.length === 0) {
        setError("Please add at least one complete service");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const validServices = services.filter((s) => s.name && s.duration && s.price);
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessData: {
              ...businessData,
              address: addressState.address,
              city: addressState.city,
              state: addressState.state,
              zipCode: addressState.zipCode,
              latitude: addressState.coordinates?.latitude,
              longitude: addressState.coordinates?.longitude,
            },
            services: validServices,
            availability,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to complete onboarding");
        }

        const data = await response.json();
        if (data.slug) {
          try {
            localStorage.setItem("businessSlug", data.slug);
          } catch (e) {}
        }

        await fetch("/api/auth/session?update", { cache: "no-store" });
        await update();

        setStep(4); // Advance to completion step
        toast.success("Business profile created successfully!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 4) {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 4) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">BiaBook</span>
          </div>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
            Setup Progress: {step}/{totalSteps}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
            <span className="text-sm">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === 1 && (
          <BusinessStep
            businessData={businessData}
            setBusinessData={setBusinessData}
            categories={categories}
            addressState={addressState}
            handleAddressChange={handleAddressChange}
            handleAddressSelect={handleAddressSelect}
            setCity={setCity}
            setState={setState}
            setZipCode={setZipCode}
            validationErrors={validationErrors}
          />
        )}

        {step === 2 && (
          <ServicesStep services={services} setServices={setServices} />
        )}

        {step === 3 && (
          <AvailabilityStep availability={availability} setAvailability={setAvailability} />
        )}

        {step === 4 && (
          <CompletionStep businessData={businessData} />
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || step === 4 || isSubmitting}
            className={step === 1 || step === 4 ? "invisible" : ""}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting
              ? "Saving..."
              : step === 3
                ? "Complete Setup"
                : step === 4
                  ? "Go to Dashboard"
                  : "Next Step"}
          </Button>
        </div>
      </div>
    </div>
  );
}
