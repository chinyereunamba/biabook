"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import type { BusinessLocationModel } from "@/types/location";

interface MultiLocationFormProps {
  businessId: string;
  initialLocation?: BusinessLocationModel | null;
  onLocationSaved: (location: BusinessLocationModel) => void;
  onCancel: () => void;
}

export function MultiLocationForm({
  businessId,
  initialLocation,
  onLocationSaved,
  onCancel,
}: MultiLocationFormProps) {
  const [formData, setFormData] = useState({
    address: initialLocation?.address || "",
    city: initialLocation?.city || "",
    state: initialLocation?.state || "",
    zipCode: initialLocation?.zipCode || "",
    country: initialLocation?.country || "US",
    latitude: initialLocation?.latitude?.toString() || "",
    longitude: initialLocation?.longitude?.toString() || "",
    timezone: initialLocation?.timezone || "",
  });

  const [serviceRadius, setServiceRadius] = useState<number | undefined>(
    initialLocation?.serviceRadius,
  );
  const [unlimitedRadius, setUnlimitedRadius] = useState(
    !initialLocation?.serviceRadius,
  );

  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);

  // Auto-detect timezone when coordinates change
  useEffect(() => {
    const detectTimezone = async () => {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (!isNaN(lat) && !isNaN(lng) && !formData.timezone) {
        try {
          const response = await fetch("/api/timezone/detect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: lat, longitude: lng }),
          });

          const data = await response.json();
          // The API returns { timezone, provider } directly
          if (data.timezone) {
            setFormData((prev) => ({ ...prev, timezone: data.timezone }));
          }
        } catch (error) {
          console.error("Failed to detect timezone:", error);
        }
      }
    };

    void detectTimezone();
  }, [formData.latitude, formData.longitude, formData.timezone]);

  const validateAndGeocode = async () => {
    if (
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      setError("Please fill in all address fields");
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationSuccess(false);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;

      // Step 1: Geocode the address
      const geocodeResponse = await fetch("/api/location/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: fullAddress }),
      });

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.success || !geocodeData.data.coordinates) {
        setError(geocodeData.error || "Failed to validate address");
        return;
      }

      const { latitude, longitude } = geocodeData.data.coordinates;

      // Step 2: Detect timezone from coordinates
      let timezone = "";
      try {
        const timezoneResponse = await fetch("/api/timezone/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        });

        const timezoneData = await timezoneResponse.json();
        timezone = timezoneData.timezone || "";
      } catch (timezoneError) {
        console.error("Timezone detection failed:", timezoneError);
        // Continue without timezone - user can enter manually if needed
      }

      // Update form data with coordinates and timezone
      setFormData((prev) => ({
        ...prev,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        timezone: timezone || prev.timezone,
      }));

      setValidationSuccess(true);
    } catch (error) {
      console.error("Geocoding error:", error);
      setError("Failed to validate address. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Please validate the address to get coordinates");
      return;
    }

    if (!formData.timezone) {
      setError("Timezone is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const locationData = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: lat,
        longitude: lng,
        timezone: formData.timezone,
        serviceRadius: unlimitedRadius ? undefined : serviceRadius,
      };

      const url = initialLocation
        ? `/api/businesses/${businessId}/locations/${initialLocation.id}`
        : `/api/businesses/${businessId}/locations`;

      const response = await fetch(url, {
        method: initialLocation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });

      const data = await response.json();

      if (data.success) {
        onLocationSaved(data.data);
      } else {
        setError(data.error || "Failed to save location");
      }
    } catch (error) {
      console.error("Save location error:", error);
      setError("Failed to save location. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Address Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, address: e.target.value }));
              setValidationSuccess(false);
            }}
            placeholder="123 Main Street"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, city: e.target.value }));
                setValidationSuccess(false);
              }}
              placeholder="New York"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, state: e.target.value }));
                setValidationSuccess(false);
              }}
              placeholder="NY"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, zipCode: e.target.value }));
                setValidationSuccess(false);
              }}
              placeholder="10001"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              placeholder="US"
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={validateAndGeocode}
          disabled={isValidating}
          variant="outline"
          className="w-full"
          type="button"
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Validate & Get Coordinates
            </>
          )}
        </Button>

        {validationSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Address validated successfully! Coordinates and timezone detected.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Coordinates Display */}
      {formData.latitude && formData.longitude && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Navigation className="h-4 w-4" />
            Coordinates & Timezone
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-bold">Latitude:</span>{" "}
              <span className="font-mono">{formData.latitude}</span>
            </div>
            <div>
              <span className="font-bold">Longitude:</span>{" "}
              <span className="font-mono">{formData.longitude}</span>
            </div>
          </div>

          {/* Timezone Input */}
          <div>
            <Label htmlFor="timezone" className="text-sm">
              Timezone {formData.timezone ? "(Auto-detected)" : "*"}
            </Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, timezone: e.target.value }))
              }
              placeholder="America/New_York"
              className="mt-1 font-mono text-sm"
            />
            <div className="mt-1 text-xs text-gray-500">
              {formData.timezone
                ? "Timezone was auto-detected. You can edit if needed."
                : "Enter timezone manually (e.g., America/New_York, Europe/London)"}
            </div>
          </div>
        </div>
      )}

      {/* Service Radius */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <div className="text-sm font-medium">Service Area</div>
        <div className="flex items-center space-x-2">
          <Switch
            id="unlimited-radius"
            checked={unlimitedRadius}
            onCheckedChange={setUnlimitedRadius}
          />
          <Label htmlFor="unlimited-radius" className="text-sm">
            Unlimited service area
          </Label>
        </div>

        {!unlimitedRadius && (
          <div>
            <Label htmlFor="service-radius" className="text-sm">
              Service Radius (miles)
            </Label>
            <Input
              id="service-radius"
              type="number"
              min="1"
              max="500"
              value={serviceRadius || ""}
              onChange={(e) =>
                setServiceRadius(parseInt(e.target.value) || undefined)
              }
              placeholder="25"
              className="mt-1"
            />
            <div className="mt-1 text-xs">
              Customers beyond this distance won't be able to book
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            isSaving ||
            !formData.address ||
            !formData.city ||
            !formData.state ||
            !formData.zipCode ||
            !formData.latitude ||
            !formData.longitude ||
            !formData.timezone
          }
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>{initialLocation ? "Update" : "Add"} Location</>
          )}
        </Button>
      </div>
    </div>
  );
}
