/**
 * Fallback component when Google Maps API is not available
 */

"use client";

import { Input } from "@/components/ui/input";
import { MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddressAutocompleteFallbackProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

/**
 * Simple address input fallback when autocomplete is not available
 */
export function AddressAutocompleteFallback({
  value,
  onChange,
  placeholder = "Enter your address",
  className,
  disabled = false,
  required = false,
  id,
}: AddressAutocompleteFallbackProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10", className)}
          disabled={disabled}
          required={required}
          autoComplete="address-line1"
        />
      </div>

      <div className="flex items-center space-x-2 rounded-md bg-yellow-50 p-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
        <p className="text-sm text-yellow-700">
          Address autocomplete is not available. Please enter your full address
          manually.
        </p>
      </div>

      <p className="text-xs text-gray-500">
        Please include street address, city, state, and ZIP code for best
        results.
      </p>
    </div>
  );
}
