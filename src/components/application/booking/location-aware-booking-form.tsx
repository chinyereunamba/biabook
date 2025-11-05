"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomerForm, type CustomerFormData } from "./customer-form";
import { ServiceCard } from "./service-card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocationSelection } from "@/hooks/use-location-selection";
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Search,
  Loader2,
  ExternalLink,
  Clock,
  DollarSign,
  Star,
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
  alternatives?: Array<{
    id: string;
    name: string;
    distance: number;
    estimatedTravelTime: number;
  }>;
}

interface LocationAwareBookingFormProps {
  businessId: string;
  businessName: string;
  businessLocation?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  appointmentDate: string;
  startTime: string;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onLocationValidationFailed?: (
    alternatives: LocationValidationResult["alternatives"],
  ) => void;
  loading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  className?: string;
}

export function LocationAwareBookingForm({
  businessId,
  businessName,
  businessLocation,
  serviceId,
  serviceName,
  servicePrice,
  serviceDuration,
  appointmentDate,
  startTime,
  onSubmit,
  onLocationValidationFailed,
  loading = false,
  error = null,
  onErrorClear,
  className = "",
}: LocationAwareBookingFormProps) {
  const [locationValidation, setLocationValidation] =
    useState<LocationValidationResult | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [skipLocationValidation, setSkipLocationValidation] = useState(false);
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
  const validateLocation = useCallback(
    async (location: { latitude: number; longitude: number }) => {
      if (!location || skipLocationValidation) return;

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

        setLocationValidation(result.validation);

        if (!result.canBook && result.validation.alternatives?.length > 0) {
          setShowAlternatives(true);
          onLocationValidationFailed?.(result.validation.alternatives);
        }

        // Show success/warning toast
        if (result.canBook) {
          toast.success("Location validated", {
            description: `You are ${result.validation.distance} miles from ${businessName}`,
          });
        } else {
          toast.warning("Outside service area", {
            description: result.message,
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
    },
    [
      businessId,
      businessName,
      skipLocationValidation,
      onLocationValidationFailed,
    ],
  );

  // Auto-validate when customer location is available
  useEffect(() => {
    if (customerLocation && !skipLocationValidation) {
      validateLocation(customerLocation);
    }
  }, [customerLocation, validateLocation, skipLocationValidation]);

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

  const handleManualLocationSearch = async (address: string) => {
    try {
      await searchByAddress(address);
    } catch (err) {
      toast.error("Address search failed", {
        description:
          "Please try a different address or use your current location",
      });
    }
  };

  const handleSkipValidation = () => {
    setSkipLocationValidation(true);
    setLocationValidation(null);
    setValidationError(null);
    toast.info("Location validation skipped", {
      description: "You can proceed with booking without location validation",
    });
  };

  const handleFormSubmit = async (data: CustomerFormData) => {
    // If location validation failed and user hasn't skipped, prevent submission
    if (
      locationValidation &&
      !locationValidation.isValid &&
      !skipLocationValidation
    ) {
      toast.error("Cannot book outside service area", {
        description:
          "Please choose an alternative business or skip location validation",
      });
      return;
    }

    await onSubmit(data);
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours || "0"), parseInt(minutes || "0"));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{serviceName}</h3>
                <p className="text-sm text-gray-600">{businessName}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ${formatPrice(servicePrice)}
                </p>
                <p className="text-sm text-gray-600">
                  {serviceDuration} minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(appointmentDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(startTime)}</span>
              </div>
            </div>

            {businessLocation && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>
                  {businessLocation.address}, {businessLocation.city},{" "}
                  {businessLocation.state} {businessLocation.zipCode}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Location Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Location Status */}
            {!customerLocation && !skipLocationValidation && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  We need to verify you're within the service area for this
                  business.
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
                    onClick={() => {
                      const address = prompt("Enter your address or zip code:");
                      if (address) {
                        handleManualLocationSearch(address);
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Enter Address
                  </Button>
                </div>

                {locationError && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {locationError}. You can enter your address manually or
                      skip location verification.
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

            {locationValidation && !validationLoading && (
              <div className="space-y-3">
                {locationValidation.isValid ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Location verified!</strong> You are{" "}
                      {locationValidation.distance} miles from{" "}
                      {locationValidation.businessName}.
                      {locationValidation.serviceRadius && (
                        <span>
                          {" "}
                          (Service area: {locationValidation.serviceRadius}{" "}
                          miles)
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Outside service area.</strong> You are{" "}
                      {locationValidation.distance} miles from{" "}
                      {locationValidation.businessName}, which is outside their{" "}
                      {locationValidation.serviceRadius
                        ? `${locationValidation.serviceRadius} mile`
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

            {/* Alternative Businesses */}
            {showAlternatives &&
              locationValidation?.alternatives &&
              locationValidation.alternatives.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Alternative Businesses Nearby
                  </h4>
                  <div className="space-y-2">
                    {locationValidation.alternatives.map((alternative) => (
                      <div
                        key={alternative.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <div>
                          <p className="font-medium">{alternative.name}</p>
                          <p className="text-sm text-gray-600">
                            {alternative.distance} miles away • ~
                            {alternative.estimatedTravelTime} min drive
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`/book/${alternative.id}`, "_blank");
                          }}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Book Here
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Skip Validation Option */}
            {!skipLocationValidation &&
              (customerLocation || validationError) && (
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

            {skipLocationValidation && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Location verification has been skipped. Please confirm with
                  the business that they can serve your location.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Form */}
      <CustomerForm
        onSubmit={handleFormSubmit}
        loading={loading}
        error={error}
        onErrorClear={onErrorClear}
      />

      {/* Booking Restrictions Notice */}
      {locationValidation &&
        !locationValidation.isValid &&
        !skipLocationValidation && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Booking Restricted:</strong> You cannot book this
              appointment because you are outside the business's service area.
              Please choose an alternative business or contact {businessName}{" "}
              directly to discuss your location.
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
