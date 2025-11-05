"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type {
  BusinessLocationModel,
  LocationInput,
  AddressValidation,
} from "@/types/location";

interface BusinessLocationFormProps {
  businessId: string;
  initialLocation?: BusinessLocationModel | null;
  onLocationUpdate?: (location: BusinessLocationModel) => void;
}

interface AddressSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export function BusinessLocationForm({
  businessId,
  initialLocation,
  onLocationUpdate,
}: BusinessLocationFormProps) {
  const [formData, setFormData] = useState<LocationInput>({
    address: initialLocation?.address || "",
    city: initialLocation?.city || "",
    state: initialLocation?.state || "",
    zipCode: initialLocation?.zipCode || "",
    country: initialLocation?.country || "US",
    coordinates: initialLocation
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        }
      : undefined,
  });

  const [serviceRadius, setServiceRadius] = useState<number | undefined>(
    initialLocation?.serviceRadius,
  );
  const [unlimitedRadius, setUnlimitedRadius] = useState(
    !initialLocation?.serviceRadius,
  );

  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [validation, setValidation] = useState<AddressValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [manualCoordinates, setManualCoordinates] = useState(false);
  const [coordinateInput, setCoordinateInput] = useState({
    latitude: formData.coordinates?.latitude?.toString() || "",
    longitude: formData.coordinates?.longitude?.toString() || "",
  });

  // Debounced address autocomplete
  const fetchAddressSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/location/autocomplete?input=${encodeURIComponent(input)}`,
      );
      const data = await response.json();

      if (data.success) {
        setAddressSuggestions(data.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Failed to fetch address suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounce address input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address && !manualCoordinates) {
        fetchAddressSuggestions(formData.address);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.address, fetchAddressSuggestions, manualCoordinates]);

  const handleAddressSelect = async (suggestion: AddressSuggestion) => {
    setShowSuggestions(false);
    setIsValidating(true);

    try {
      // Get place details
      const response = await fetch("/api/location/place-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: suggestion.placeId }),
      });

      const data = await response.json();

      if (data.success) {
        const { address, coordinates } = data.data;
        setFormData({
          address: address.address,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          coordinates,
        });

        setCoordinateInput({
          latitude: coordinates.latitude.toString(),
          longitude: coordinates.longitude.toString(),
        });

        setValidation({
          isValid: true,
          formattedAddress: data.data.formattedAddress,
          coordinates,
        });
      }
    } catch (error) {
      console.error("Failed to get place details:", error);
      setError("Failed to get address details. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const validateAddress = async () => {
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

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      const response = await fetch("/api/location/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: fullAddress }),
      });

      const data = await response.json();

      if (data.success) {
        setValidation(data.data);
        if (data.data.isValid && data.data.coordinates) {
          setFormData((prev) => ({
            ...prev,
            coordinates: data.data.coordinates,
          }));
          setCoordinateInput({
            latitude: data.data.coordinates.latitude.toString(),
            longitude: data.data.coordinates.longitude.toString(),
          });
        }
      } else {
        setError(data.error || "Address validation failed");
      }
    } catch (error) {
      console.error("Address validation error:", error);
      setError("Failed to validate address. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCoordinateChange = (
    field: "latitude" | "longitude",
    value: string,
  ) => {
    setCoordinateInput((prev) => ({ ...prev, [field]: value }));

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [field]: numValue,
        } as any,
      }));
    }
  };

  const saveLocation = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const locationData = {
        ...formData,
        serviceRadius: unlimitedRadius ? undefined : serviceRadius,
      };

      const response = await fetch(`/api/businesses/${businessId}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Location saved successfully!");
        onLocationUpdate?.(data.data);
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
      {/* Address Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Address
          </CardTitle>
          <CardDescription>
            Enter your business address to enable location-based features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, address: e.target.value }));
                setValidation(null);
              }}
              placeholder="123 Main Street"
              className="mt-1"
            />
            {isLoadingSuggestions && (
              <Loader2 className="absolute top-8 right-3 h-4 w-4 animate-spin" />
            )}

            {/* Address Suggestions */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                {addressSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.placeId}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    <div className="font-medium">{suggestion.mainText}</div>
                    <div className="text-sm text-gray-500">
                      {suggestion.secondaryText}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, city: e.target.value }));
                  setValidation(null);
                }}
                placeholder="New York"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, state: e.target.value }));
                  setValidation(null);
                }}
                placeholder="NY"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, zipCode: e.target.value }));
                  setValidation(null);
                }}
                placeholder="10001"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, country: e.target.value }));
                  setValidation(null);
                }}
                placeholder="US"
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={validateAddress}
            disabled={isValidating}
            variant="outline"
            className="w-full"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating Address...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Validate Address
              </>
            )}
          </Button>

          {/* Address Validation Results */}
          {validation && (
            <Alert
              className={
                validation.isValid
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <AlertCircle
                className={`h-4 w-4 ${validation.isValid ? "text-green-600" : "text-red-600"}`}
              />
              <AlertDescription
                className={
                  validation.isValid ? "text-green-800" : "text-red-800"
                }
              >
                {validation.isValid ? (
                  <>
                    <strong>Address validated successfully!</strong>
                    <br />
                    {validation.formattedAddress}
                  </>
                ) : (
                  <>
                    <strong>Address validation failed:</strong>
                    <br />
                    {validation.errors?.join(", ")}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Coordinates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Coordinates
          </CardTitle>
          <CardDescription>
            Precise location coordinates for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="manual-coordinates"
              checked={manualCoordinates}
              onCheckedChange={setManualCoordinates}
            />
            <Label htmlFor="manual-coordinates">
              Enter coordinates manually
            </Label>
          </div>

          {manualCoordinates && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={coordinateInput.latitude}
                  onChange={(e) =>
                    handleCoordinateChange("latitude", e.target.value)
                  }
                  placeholder="40.7128"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={coordinateInput.longitude}
                  onChange={(e) =>
                    handleCoordinateChange("longitude", e.target.value)
                  }
                  placeholder="-74.0060"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {formData.coordinates && (
            <div className="rounded-md bg-gray-50 p-3">
              <div className="text-sm font-medium text-gray-700">
                Current Coordinates:
              </div>
              <div className="text-sm text-gray-600">
                Latitude: {formData.coordinates.latitude.toFixed(6)}
                <br />
                Longitude: {formData.coordinates.longitude.toFixed(6)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Radius Section */}
      <Card>
        <CardHeader>
          <CardTitle>Service Area</CardTitle>
          <CardDescription>
            Set the maximum distance you're willing to travel for services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="unlimited-radius"
              checked={unlimitedRadius}
              onCheckedChange={setUnlimitedRadius}
            />
            <Label htmlFor="unlimited-radius">Unlimited service area</Label>
          </div>

          {!unlimitedRadius && (
            <div>
              <Label htmlFor="service-radius">Service Radius (miles)</Label>
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
              <div className="mt-1 text-sm text-gray-500">
                Customers beyond this distance won't be able to book your
                services
              </div>
            </div>
          )}

          {serviceRadius && !unlimitedRadius && (
            <div className="rounded-md bg-blue-50 p-3">
              <div className="text-sm text-blue-800">
                Your service area covers approximately{" "}
                {Math.round(
                  Math.PI * serviceRadius * serviceRadius,
                ).toLocaleString()}{" "}
                square miles
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveLocation}
          disabled={
            isSaving ||
            !formData.address ||
            !formData.city ||
            !formData.state ||
            !formData.zipCode
          }
          className="min-w-32"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Location"
          )}
        </Button>
      </div>
    </div>
  );
}
