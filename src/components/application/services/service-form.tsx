"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
} from "@/server/repositories/service-repository";

export interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  bufferTime: number;
  isActive: boolean;
}

export interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ServiceForm({
  service,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: ServiceFormProps) {
  const [formData, setFormData] = React.useState<ServiceFormData>({
    name: service?.name ?? "",
    description: service?.description ?? "",
    duration: service?.duration ?? 60,
    price: service?.price ?? 0,
    category: service?.category ?? "",
    bufferTime: service?.bufferTime ?? 0,
    isActive: service?.isActive ?? true,
  });

  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ServiceFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }

    if (formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (formData.bufferTime < 0) {
      newErrors.bufferTime = "Buffer time cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error will be handled by the parent component's error handling
      throw error;
    }
  };

  const handleInputChange = (
    field: keyof ServiceFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPriceForDisplay = (cents: number): string => {
    return (cents / 100).toFixed(2);
  };

  const parsePriceFromDisplay = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100);
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle>{service ? "Edit Service" : "Add New Service"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Haircut, Massage, Consultation"
              aria-invalid={!!errors.name}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the service"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Duration and Price Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  handleInputChange("duration", parseInt(e.target.value) ?? 0)
                }
                placeholder="60"
                aria-invalid={!!errors.duration}
                disabled={isLoading}
              />
              {errors.duration && (
                <p className="text-destructive text-sm">{errors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formatPriceForDisplay(formData.price)}
                onChange={(e) =>
                  handleInputChange(
                    "price",
                    parsePriceFromDisplay(e.target.value),
                  )
                }
                placeholder="50.00"
                aria-invalid={!!errors.price}
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-destructive text-sm">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Category and Buffer Time Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="e.g., Hair, Wellness, Consultation"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
              <Input
                id="bufferTime"
                type="number"
                min="0"
                value={formData.bufferTime}
                onChange={(e) =>
                  handleInputChange("bufferTime", parseInt(e.target.value) ?? 0)
                }
                placeholder="15"
                aria-invalid={!!errors.bufferTime}
                disabled={isLoading}
              />
              {errors.bufferTime && (
                <p className="text-destructive text-sm">{errors.bufferTime}</p>
              )}
              <p className="text-muted-foreground text-xs">
                Time between appointments for preparation/cleanup
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
              disabled={isLoading}
            />
            <Label htmlFor="isActive">
              Service is active and available for booking
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : service
                  ? "Update Service"
                  : "Create Service"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ServiceForm;
