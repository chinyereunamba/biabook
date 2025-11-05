"use client";

import { useState } from "react";
import { MapPin, Navigation, Search, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationPermissionRequest } from "./location-permission-request";
import { ManualLocationEntry } from "./manual-location-entry";
import {
  useLocationSelection,
  type LocationSelection,
} from "@/hooks/use-location-selection";
import { cn } from "@/lib/utils";
import type { Coordinates, Address } from "@/types/location";

export interface LocationSelectorProps {
  onLocationSelected: (location: LocationSelection) => void;
  onLocationCleared?: () => void;
  title?: string;
  description?: string;
  showCurrentSelection?: boolean;
  allowClear?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function LocationSelector({
  onLocationSelected,
  onLocationCleared,
  title = "Select your location",
  description = "Choose your location to find nearby businesses and services.",
  showCurrentSelection = true,
  allowClear = true,
  className,
  autoFocus = false,
}: LocationSelectorProps) {
  const [mode, setMode] = useState<"permission" | "manual" | "selected">(
    "permission",
  );

  const {
    location,
    isLoading,
    error,
    canUseGeolocation,
    selectLocation,
    clearLocation,
    clearError,
  } = useLocationSelection();

  // Handle location selection from geolocation
  const handleGeolocationSuccess = (coordinates: Coordinates) => {
    const locationSelection: LocationSelection = {
      coordinates,
      source: "geolocation",
      displayText: "Current location",
    };
    selectLocation(coordinates);
    onLocationSelected(locationSelection);
    setMode("selected");
  };

  // Handle manual location entry
  const handleManualLocationSelected = (
    coordinates: Coordinates,
    address?: Address,
    zipCode?: string,
  ) => {
    selectLocation(coordinates, address, zipCode);
    if (location) {
      onLocationSelected(location);
    }
    setMode("selected");
  };

  // Handle location clearing
  const handleClearLocation = () => {
    clearLocation();
    clearError();
    onLocationCleared?.();
    setMode("permission");
  };

  // Handle manual entry request
  const handleManualEntryRequested = () => {
    setMode("manual");
  };

  // Handle back from manual entry
  const handleBackFromManual = () => {
    setMode("permission");
  };

  // If we have a location and showing current selection, show the selected state
  if (location && showCurrentSelection && mode === "selected") {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {location.displayText}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {location.source === "geolocation" && "GPS"}
                    {location.source === "address" && "Address"}
                    {location.source === "zipcode" && "ZIP"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Location selected successfully
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("manual")}
              >
                <Search className="mr-2 h-4 w-4" />
                Change
              </Button>
              {allowClear && (
                <Button variant="ghost" size="sm" onClick={handleClearLocation}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show manual entry mode
  if (mode === "manual") {
    return (
      <ManualLocationEntry
        onLocationSelected={handleManualLocationSelected}
        onBack={canUseGeolocation ? handleBackFromManual : undefined}
        title={title}
        description={description}
        showGeolocationOption={canUseGeolocation}
        className={className}
      />
    );
  }

  // Show permission request mode (default)
  return (
    <LocationPermissionRequest
      onLocationGranted={handleGeolocationSuccess}
      onManualEntryRequested={handleManualEntryRequested}
      title={title}
      description={description}
      showManualEntry={true}
      className={className}
    />
  );
}

// Compact version for inline use
export interface CompactLocationSelectorProps {
  onLocationSelected: (location: LocationSelection) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CompactLocationSelector({
  onLocationSelected,
  placeholder = "Enter your location",
  className,
  disabled = false,
}: CompactLocationSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSelection | null>(null);

  const handleLocationSelected = (location: LocationSelection) => {
    setSelectedLocation(location);
    setIsExpanded(false);
    onLocationSelected(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
  };

  if (isExpanded) {
    return (
      <div className={cn("relative", className)}>
        <LocationSelector
          onLocationSelected={handleLocationSelected}
          onLocationCleared={handleClearLocation}
          showCurrentSelection={false}
          allowClear={false}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className="w-full justify-start text-left font-normal"
      >
        <MapPin className="mr-2 h-4 w-4" />
        {selectedLocation ? selectedLocation.displayText : placeholder}
      </Button>
      {selectedLocation && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearLocation}
          className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Location display component for showing selected location
export interface LocationDisplayProps {
  location: LocationSelection;
  showBadge?: boolean;
  showCoordinates?: boolean;
  className?: string;
}

export function LocationDisplay({
  location,
  showBadge = true,
  showCoordinates = false,
  className,
}: LocationDisplayProps) {
  const getSourceIcon = () => {
    switch (location.source) {
      case "geolocation":
        return <Navigation className="h-4 w-4" />;
      case "address":
        return <Search className="h-4 w-4" />;
      case "zipcode":
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getSourceLabel = () => {
    switch (location.source) {
      case "geolocation":
        return "GPS Location";
      case "address":
        return "Address";
      case "zipcode":
        return "ZIP Code";
      default:
        return "Location";
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        {getSourceIcon()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-gray-900 dark:text-gray-100">
            {location.displayText}
          </span>
          {showBadge && (
            <Badge variant="secondary" className="text-xs">
              {getSourceLabel()}
            </Badge>
          )}
        </div>
        {showCoordinates && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {location.coordinates.latitude.toFixed(6)},{" "}
            {location.coordinates.longitude.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}
