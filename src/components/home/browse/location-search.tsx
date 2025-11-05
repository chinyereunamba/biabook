"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Search,
  Loader2,
  X,
  Target,
  Sliders,
} from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { CompactLocationSelector } from "@/components/application/location-selector";
import type { LocationSelection } from "@/hooks/use-location-selection";
import type { Coordinates } from "@/types/location";
import { cn } from "@/lib/utils";

export interface LocationSearchProps {
  onLocationSearch: (params: LocationSearchParams) => void;
  onLocationClear: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface LocationSearchParams {
  coordinates?: Coordinates;
  address?: string;
  zipCode?: string;
  radius: number;
  displayText: string;
}

const RADIUS_OPTIONS = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles" },
];

export function LocationSearch({
  onLocationSearch,
  onLocationClear,
  isLoading = false,
  className,
}: LocationSearchProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSelection | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [manualZipCode, setManualZipCode] = useState("");
  const [searchMode, setSearchMode] = useState<"location" | "address" | "zip">(
    "location",
  );

  const {
    getCurrentLocation,
    isLoading: geoLoading,
    error: geoError,
    coordinates: geoCoordinates,
  } = useGeolocation();

  const handleLocationSelected = useCallback(
    (location: LocationSelection) => {
      setSelectedLocation(location);
      setSearchMode("location");

      const searchParams: LocationSearchParams = {
        coordinates: location.coordinates,
        radius: selectedRadius,
        displayText: location.displayText,
      };

      onLocationSearch(searchParams);
    },
    [selectedRadius, onLocationSearch],
  );

  const handleCurrentLocation = useCallback(async () => {
    try {
      await getCurrentLocation();
      if (geoCoordinates) {
        const location: LocationSelection = {
          coordinates: geoCoordinates,
          source: "geolocation",
          displayText: "Current location",
        };
        handleLocationSelected(location);
      }
    } catch (error) {
      console.error("Failed to get current location:", error);
    }
  }, [getCurrentLocation, geoCoordinates, handleLocationSelected]);

  const handleAddressSearch = useCallback(() => {
    if (!manualAddress.trim()) return;

    setSearchMode("address");
    const searchParams: LocationSearchParams = {
      address: manualAddress.trim(),
      radius: selectedRadius,
      displayText: manualAddress.trim(),
    };

    onLocationSearch(searchParams);
  }, [manualAddress, selectedRadius, onLocationSearch]);

  const handleZipCodeSearch = useCallback(() => {
    if (!manualZipCode.trim()) return;

    setSearchMode("zip");
    const searchParams: LocationSearchParams = {
      zipCode: manualZipCode.trim(),
      radius: selectedRadius,
      displayText: `${manualZipCode.trim()} area`,
    };

    onLocationSearch(searchParams);
  }, [manualZipCode, selectedRadius, onLocationSearch]);

  const handleRadiusChange = useCallback(
    (newRadius: number) => {
      setSelectedRadius(newRadius);

      // Re-search with new radius if we have a location
      if (selectedLocation && searchMode === "location") {
        const searchParams: LocationSearchParams = {
          coordinates: selectedLocation.coordinates,
          radius: newRadius,
          displayText: selectedLocation.displayText,
        };
        onLocationSearch(searchParams);
      } else if (manualAddress && searchMode === "address") {
        const searchParams: LocationSearchParams = {
          address: manualAddress,
          radius: newRadius,
          displayText: manualAddress,
        };
        onLocationSearch(searchParams);
      } else if (manualZipCode && searchMode === "zip") {
        const searchParams: LocationSearchParams = {
          zipCode: manualZipCode,
          radius: newRadius,
          displayText: `${manualZipCode} area`,
        };
        onLocationSearch(searchParams);
      }
    },
    [
      selectedLocation,
      manualAddress,
      manualZipCode,
      searchMode,
      onLocationSearch,
    ],
  );

  const handleClear = useCallback(() => {
    setSelectedLocation(null);
    setManualAddress("");
    setManualZipCode("");
    setSearchMode("location");
    onLocationClear();
  }, [onLocationClear]);

  const hasActiveSearch = selectedLocation || manualAddress || manualZipCode;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Section */}
      <div className="space-y-3">
        {/* Location Selector */}
        <div className="flex gap-2">
          <div className="flex-1">
            <CompactLocationSelector
              onLocationSelected={handleLocationSelected}
              placeholder="Enter your location"
              disabled={isLoading}
            />
          </div>
          <Button
            variant="outline"
            size="default"
            onClick={handleCurrentLocation}
            disabled={geoLoading || isLoading}
            className="px-3"
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            className="px-3"
          >
            <Sliders className="h-4 w-4" />
          </Button>
        </div>

        {/* Alternative Search Methods */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {/* Address Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
              disabled={isLoading}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddressSearch}
              disabled={!manualAddress.trim() || isLoading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* ZIP Code Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by ZIP code"
              value={manualZipCode}
              onChange={(e) => setManualZipCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleZipCodeSearch()}
              disabled={isLoading}
              className="text-sm"
              maxLength={10}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleZipCodeSearch}
              disabled={!manualZipCode.trim() || isLoading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Search Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Radius Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Radius
            </label>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    selectedRadius === option.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleRadiusChange(option.value)}
                  disabled={isLoading}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Search Display */}
      {hasActiveSearch && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Searching near:{" "}
              {selectedLocation?.displayText ||
                manualAddress ||
                `${manualZipCode} area`}
            </span>
            <Badge variant="secondary" className="text-xs">
              {selectedRadius} miles
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Error Display */}
      {geoError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            {geoError.message}
          </p>
        </div>
      )}
    </div>
  );
}
