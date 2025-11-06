"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlternativeBusinesses,
  type AlternativeBusiness,
} from "./alternative-businesses";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocationSelection } from "@/hooks/use-location-selection";
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Search,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface LocationValidationResult {
  isValid: boolean;
  distance: number;
  serviceRadius: number | null;
  businessName: string;
  businessLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  alternatives?: AlternativeBusiness[];
}

interface BookingLocationValidatorProps {
  businessId: string;
  businessName: string;
  businessLocation?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  onValidationComplete?: (result: LocationValidationResult) => void;
  onValidationSkipped?: () => void;
  onAlternativeSelected?: (businessId: string) => void;
  autoValidate?: boolean;
  className?: string;
}

export function BookingLocationValidator({
  businessId,
  businessName,
  businessLocation,
  onValidationComplete,
  onValidationSkipped,
  onAlternativeSelected,
  autoValidate = true,
  className = "",
}: BookingLocationValidatorProps) {
  const [validationResult, setValidationResult] =
    useState<LocationValidationResult | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Use geolocation hook for automatic location detection
  const {
    location: currentLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    hasPermission,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    autoRequest: autoValidate,
  });

  // Use location selection hook for manual location entry
  const {
    selectedLocation,
    searchQuery,
    searchResults,
    isSearching,
    selectLocation,
    searchByAddress,
    clearSelection,
  } = useLocationSelection();

  // Get the customer location (either from GPS or manual selection)
  const customerLocation = selectedLocation || currentLocation;

  // Validate location when customer location changes
  useEffect(() => {
    if (customerLocation && !isSkipped && autoValidate) {
      validateLocation(customerLocation);
    }
  }, [customerLocation, isSkipped, autoValidate]);

  const validateLocation = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    setValidationLoading(true);
    setValidationError(null);

    try {
      const response = await fetch("/api/bookings/validate-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          customerLocation: location,
          includeAlternatives: true,
          maxAlternativeRadius: 50,
          maxAlternatives: 5,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to validate location");
      }

      const validation = result.validation;
      setValidationResult(validation);
      onValidationComplete?.(validation);

      if (!validation.isValid && validation.alternatives?.length > 0) {
        setShowAlternatives(true);
      }

      // Show success/warning toast
      if (validation.isValid) {
        toast.success("Location validated", {
          description: `You are ${validation.distance} miles from ${businessName}`,
        });
      } else {
        toast.warning("Outside service area", {
          description: `You are ${validation.distance} miles from ${businessName}, which is outside their service area.`,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to validate location";
      setValidationError(errorMessage);
      toast.error("Location validation failed", {
        description: errorMessage,
      });
    } finally {
      setValidationLoading(false);
    }
  };

  const handleLocationRequest = async () => {
    try {
      await requestLocation();
    } catch (err) {
      toast.error("Location access denied", {
        description:
          "Please enter your address manually or allow location access",
      });
    }
  };

  const handleManualLocationSearch = async () => {
    const address = prompt("Enter your address or zip code:");
    if (address) {
      try {
        await searchByAddress(address);
      } catch (err) {
        toast.error("Address search failed", {
          description:
            "Please try a different address or use your current location",
        });
      }
    }
  };

  const handleSkipValidation = () => {
    setIsSkipped(true);
    setValidationResult(null);
    setValidationError(null);
    setShowAlternatives(false);
    onValidationSkipped?.();
    toast.info("Location validation skipped", {
      description: "You can proceed with booking without location validation",
    });
  };

  const handleRetryValidation = () => {
    setIsSkipped(false);
    setValidationError(null);
    if (customerLocation) {
      validateLocation(customerLocation);
    }
  };

  const handleAlternativeSelect = (businessId: string) => {
    onAlternativeSelected?.(businessId);
    // Open the alternative business booking page in a new tab
    window.open(`/book/${businessId}`, "_blank");
  };

  if (isSkipped) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Location validation has been skipped. Please confirm with the
                business that they can serve your location.
              </span>
              <Button
                onClick={handleRetryValidation}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Location Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location Status */}
          {!customerLocation && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                We need to verify you're within the service area for{" "}
                {businessName}.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={handleLocationRequest}
                  disabled={locationLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Use Current Location
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleManualLocationSearch}
                  variant="outline"
                  className="flex-1"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Enter Address
                    </>
                  )}
                </Button>
              </div>

              {locationError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {locationError}. You can enter your address manually or skip
                    location verification.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Location Validation Results */}
          {validationLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Validating your location...</span>
            </div>
          )}

          {validationResult && !validationLoading && (
            <div className="space-y-3">
              {validationResult.isValid ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Location verified!</strong> You are{" "}
                    {validationResult.distance} miles from{" "}
                    {validationResult.businessName}.
                    {validationResult.serviceRadius && (
                      <span>
                        {" "}
                        (Service area: {validationResult.serviceRadius} miles)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Outside service area.</strong> You are{" "}
                    {validationResult.distance} miles from{" "}
                    {validationResult.businessName}, which is outside their{" "}
                    {validationResult.serviceRadius
                      ? `${validationResult.serviceRadius} mile`
                      : "unlimited"}{" "}
                    service area.
                  </AlertDescription>
                </Alert>
              )}

              {customerLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Using location: {customerLocation.latitude.toFixed(4)},{" "}
                    {customerLocation.longitude.toFixed(4)}
                  </span>
                  <Button
                    onClick={clearSelection}
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs"
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>
          )}

          {validationError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Skip Validation Option */}
          {(customerLocation || validationError) && (
            <div className="border-t pt-3">
              <Button
                onClick={handleSkipValidation}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                Skip location verification and book anyway
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative Businesses */}
      {showAlternatives && validationResult?.alternatives && (
        <AlternativeBusinesses
          alternatives={validationResult.alternatives}
          originalBusinessName={businessName}
          customerLocation={customerLocation || undefined}
          onBusinessSelect={handleAlternativeSelect}
        />
      )}
    </div>
  );
}
