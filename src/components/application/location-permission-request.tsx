"use client";

import { useState } from "react";
import { MapPin, AlertCircle, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { Coordinates } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";

export interface LocationPermissionRequestProps {
  onLocationGranted: (coordinates: Coordinates) => void;
  onManualEntryRequested: () => void;
  title?: string;
  description?: string;
  showManualEntry?: boolean;
  className?: string;
}

export function LocationPermissionRequest({
  onLocationGranted,
  onManualEntryRequested,
  title = "Find businesses near you",
  description = "Allow location access to discover nearby services and get accurate directions.",
  showManualEntry = true,
  className,
}: LocationPermissionRequestProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const {
    location: coordinates,
    error,
    loading,
    requestLocation: getCurrentLocation,
    hasPermission,
    clearError,
  } = useGeolocation();

  // Handle successful location
  if (coordinates) {
    onLocationGranted(coordinates);
    return null;
  }

  const handleRequestLocation = async () => {
    setIsRequesting(true);
    clearError();

    try {
      await getCurrentLocation();
    } catch (err) {
      console.error("Failed to request location permission:", err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleManualEntry = () => {
    clearError();
    onManualEntryRequested();
  };

  const getErrorMessage = (error: string): string => {
    if (error.includes("denied")) {
      return "Location access was denied. You can enable it in your browser settings or enter your location manually.";
    }
    if (error.includes("unavailable")) {
      return "Unable to determine your location. Please check your internet connection or enter your location manually.";
    }
    if (error.includes("timeout")) {
      return "Location request timed out. Please try again or enter your location manually.";
    }
    return (
      error ||
      "Unable to access your location. Please try again or enter your location manually."
    );
  };

  const canRequestLocation =
    typeof navigator !== "undefined" && "geolocation" in navigator;
  const isLocationDenied = !hasPermission && error?.includes("denied");

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        )}

        {!canRequestLocation && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn't support location services. Please enter your
              location manually.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {canRequestLocation && !isLocationDenied && (
            <Button
              onClick={handleRequestLocation}
              disabled={isRequesting}
              className="w-full"
              size="lg"
            >
              <Navigation className="mr-2 h-4 w-4" />
              {isRequesting
                ? "Getting your location..."
                : "Use my current location"}
            </Button>
          )}

          {showManualEntry && (
            <Button
              onClick={handleManualEntry}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Search className="mr-2 h-4 w-4" />
              Enter location manually
            </Button>
          )}
        </div>

        {isLocationDenied && (
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Location access is blocked
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              To enable location access:
            </p>
            <ol className="mt-2 list-inside list-decimal text-sm text-gray-600 dark:text-gray-400">
              <li>Click the location icon in your browser's address bar</li>
              <li>Select "Allow" for location access</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            We use your location only to find nearby businesses and provide
            directions. Your location is not stored or shared.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified version for inline use
export interface LocationRequestButtonProps {
  onLocationGranted: (coordinates: Coordinates) => void;
  onError?: (error: LocationError) => void;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  className?: string;
}

export function LocationRequestButton({
  onLocationGranted,
  onError,
  children = "Get my location",
  variant = "default",
  size = "default",
  className,
}: LocationRequestButtonProps) {
  const {
    location: coordinates,
    error,
    loading: isLoading,
    requestLocation: getCurrentLocation,
    hasPermission,
  } = useGeolocation();

  const canRequestLocation =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  // Handle successful location
  if (coordinates) {
    onLocationGranted(coordinates);
  }

  // Handle error
  if (error && onError) {
    const locationError = new LocationError(
      LocationErrorCode.GEOLOCATION_UNAVAILABLE,
      error,
    );
    onError(locationError);
  }

  const handleClick = async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      const locationError = new LocationError(
        LocationErrorCode.GEOLOCATION_UNAVAILABLE,
        "Geolocation is not supported",
      );
      onError?.(locationError);
      return;
    }

    try {
      await getCurrentLocation();
    } catch (err) {
      const locationError = new LocationError(
        LocationErrorCode.GEOLOCATION_UNAVAILABLE,
        err instanceof Error ? err.message : "Unknown error",
      );
      onError?.(locationError);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !canRequestLocation}
      variant={variant}
      size={size}
      className={className}
    >
      <Navigation className="mr-2 h-4 w-4" />
      {isLoading ? "Getting location..." : children}
    </Button>
  );
}
