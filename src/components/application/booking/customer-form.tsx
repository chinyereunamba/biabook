"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MessageSquare, Loader2 } from "lucide-react";
import { z } from "zod";

// Validation schema
const customerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long")
    .regex(
      /^[a-zA-Z\s'-\.]+$/,
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods",
    )
    .refine(
      (name) => name.trim().split(/\s+/).length >= 1,
      "Please enter your full name",
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email is too long")
    .refine(
      (email) => !email.includes(".."),
      "Email cannot contain consecutive dots",
    )
    .refine(
      (email) => !email.startsWith(".") && !email.endsWith("."),
      "Email cannot start or end with a dot",
    ),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((phone) => {
      const digits = phone.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Phone number must be between 10-15 digits")
    .refine((phone) => {
      // Allow international format or US format
      const cleanPhone = phone.replace(/\D/g, "");
      return /^[\d]{10,15}$/.test(cleanPhone);
    }, "Please enter a valid phone number"),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function CustomerForm({
  initialData = {},
  onSubmit,
  loading = false,
  className = "",
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    notes: initialData.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof CustomerFormData, value: string) => {
    try {
      const fieldSchema = customerFormSchema.shape[field];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.issues[0]?.message || "Invalid value",
        }));
      }
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate on change if field has been touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleInputBlur = (field: keyof CustomerFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field] || "");
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except + at the beginning
    let digits = value.replace(/[^\d+]/g, "");

    // Handle international numbers starting with +
    if (digits.startsWith("+")) {
      const countryCode = digits.slice(1);
      if (countryCode.length <= 15) {
        return `+${countryCode}`;
      }
      return `+${countryCode.slice(0, 15)}`;
    }

    // Format US numbers as (XXX) XXX-XXXX
    digits = digits.replace(/^\+?1?/, ""); // Remove country code if present

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      // Limit to 10 digits for US numbers
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange("phone", formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = Object.keys(formData) as (keyof CustomerFormData)[];
    setTouched(Object.fromEntries(allFields.map((field) => [field, true])));

    // Validate all fields
    try {
      const validatedData = customerFormSchema.parse(formData);

      // Clear any existing errors
      setErrors({});

      // Submit the form
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const hasErrors = Object.values(errors).some((error) => error !== "");
  const isFormValid =
    formData.name && formData.email && formData.phone && !hasErrors;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className={`pl-10 ${errors.name ? "border-red-500 focus:border-red-500" : touched.name && !errors.name ? "border-green-500" : ""}`}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={() => handleInputBlur("name")}
                disabled={loading}
                required
                autoComplete="name"
              />
            </div>
            {errors.name && (
              <p className="flex items-center text-sm text-red-600">
                <span className="mr-1">⚠️</span>
                {errors.name}
              </p>
            )}
            {touched.name && !errors.name && formData.name && (
              <p className="flex items-center text-sm text-green-600">
                <span className="mr-1">✓</span>
                Looks good!
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className={`pl-10 ${errors.email ? "border-red-500 focus:border-red-500" : touched.email && !errors.email ? "border-green-500" : ""}`}
                value={formData.email}
                onChange={(e) =>
                  handleInputChange("email", e.target.value.toLowerCase())
                }
                onBlur={() => handleInputBlur("email")}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="flex items-center text-sm text-red-600">
                <span className="mr-1">⚠️</span>
                {errors.email}
              </p>
            )}
            {touched.email && !errors.email && formData.email && (
              <p className="flex items-center text-sm text-green-600">
                <span className="mr-1">✓</span>
                Valid email address
              </p>
            )}
            <p className="text-xs text-gray-500">
              We'll send your booking confirmation here
            </p>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567 or +1 555 123 4567"
                className={`pl-10 ${errors.phone ? "border-red-500 focus:border-red-500" : touched.phone && !errors.phone ? "border-green-500" : ""}`}
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleInputBlur("phone")}
                disabled={loading}
                required
                autoComplete="tel"
              />
            </div>
            {errors.phone && (
              <p className="flex items-center text-sm text-red-600">
                <span className="mr-1">⚠️</span>
                {errors.phone}
              </p>
            )}
            {touched.phone && !errors.phone && formData.phone && (
              <p className="flex items-center text-sm text-green-600">
                <span className="mr-1">✓</span>
                Valid phone number
              </p>
            )}
            <p className="text-xs text-gray-500">
              We'll use this to send you appointment reminders via SMS
            </p>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional Notes (Optional)
            </Label>
            <div className="relative">
              <MessageSquare className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="notes"
                placeholder="Any special requests or information..."
                className={`min-h-[80px] resize-none pl-10 ${errors.notes ? "border-red-500 focus:border-red-500" : ""}`}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                onBlur={() => handleInputBlur("notes")}
                disabled={loading}
                maxLength={500}
              />
            </div>
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes}</p>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Optional - any special requests or information</span>
              <span>{formData.notes?.length || 0}/500</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="md"
            className="w-full"
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>

          {/* Privacy Notice */}
          <p className="text-center text-xs text-gray-500">
            By booking, you agree to receive appointment confirmations and
            reminders via email and SMS. Your information will only be shared
            with the business you're booking with.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
