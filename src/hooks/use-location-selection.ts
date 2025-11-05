"use client";

import { useState, useCallback } from "react";
import { useGeolocation } from "./use-geolocation";
import type { Coordinates, Address, LocationError } from "@/types/location";

export interface LocationSelection {
  coordinates: Coordinates;
  address?: Address;
  zipCode?: string;
  source: "geolocation" | "address" | "zipcode";
  displayText: string;
}

export interface UseLocationSelectionOptions {
  immediate?: boolean;
  enableGeolocation?: boolean;
}

export interface UseLocationSelectionResult {
  location: LocationSelection | null;
  isLoading: boolean;
  error: LocationError | null;
  isGeolocationSupported: boolean;
  permissionStatus: any;

  // Actions
  getCurrentLocation: () => Promise<void>;
  selectLocation: (
    coordinates: Coordinates,
    address?: Address,
    zipCode?: string,
  ) => void;
  clearLocation: () => void;
  clearError: () => void;

  // UI state helpers
  showManualEntry: boolean;
  canUseGeolocation: boolean;
}

export function useLocationSelection(
  options: UseLocationSelectionOptions = {},
): UseLocationSelectionResult {
  const { immediate = false, enableGeolocation = true } = options;

  const [location, setLocation] = useState<LocationSelection | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const {
    coordinates: geoCoordinates,
    error: geoError,
    isLoading: geoLoading,
    isSupported: isGeolocationSupported,
    permissionStatus,
    getCurrentLocation: getGeoLocation,
    clearError: clearGeoError,
    clearLocation: clearGeoLocation,
  } = useGeolocation({
    immediate: immediate && enableGeolocation,
  });

  // Handle successful geolocation
  if (geoCoordinates && !location) {
    const geoLocation: LocationSelection = {
      coordinates: geoCoordinates,
      source: "geolocation",
      displayText: "Current location",
    };
    setLocation(geoLocation);
  }

  const getCurrentLocation = useCallback(async () => {
    if (!enableGeolocation) {
      setShowManualEntry(true);
      return;
    }

    try {
      await getGeoLocation();
      setShowManualEntry(false);
    } catch (error) {
      console.warn("Geolocation failed, showing manual entry:", error);
      setShowManualEntry(true);
    }
  }, [enableGeolocation, getGeoLocation]);

  const selectLocation = useCallback(
    (coordinates: Coordinates, address?: Address, zipCode?: string) => {
      let displayText: string;
      let source: LocationSelection["source"];

      if (address) {
        displayText = `${address.address}, ${address.city}, ${address.state} ${address.zipCode}`;
        source = "address";
      } else if (zipCode) {
        displayText = zipCode;
        source = "zipcode";
      } else {
        displayText = "Selected location";
        source = "geolocation";
      }

      const newLocation: LocationSelection = {
        coordinates,
        address,
        zipCode,
        source,
        displayText,
      };

      setLocation(newLocation);
      setShowManualEntry(false);
      clearGeoError();
    },
    [clearGeoError],
  );

  const clearLocation = useCallback(() => {
    setLocation(null);
    clearGeoLocation();
    setShowManualEntry(false);
  }, [clearGeoLocation]);

  const clearError = useCallback(() => {
    clearGeoError();
  }, [clearGeoError]);

  const canUseGeolocation =
    enableGeolocation &&
    isGeolocationSupported &&
    permissionStatus?.canRequest !== false;

  return {
    location,
    isLoading: geoLoading,
    error: geoError,
    isGeolocationSupported,
    permissionStatus,

    getCurrentLocation,
    selectLocation,
    clearLocation,
    clearError,

    showManualEntry: showManualEntry || (!canUseGeolocation && !location),
    canUseGeolocation,
  };
}

// Hook for location-based business search
export interface UseLocationSearchOptions {
  autoSearch?: boolean;
  defaultRadius?: number;
}

export interface UseLocationSearchResult extends UseLocationSelectionResult {
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  searchLocation: LocationSelection | null;
  isSearchReady: boolean;
}

export function useLocationSearch(
  options: UseLocationSearchOptions = {},
): UseLocationSearchResult {
  const { autoSearch = false, defaultRadius = 25 } = options;

  const [searchRadius, setSearchRadius] = useState(defaultRadius);

  const locationSelection = useLocationSelection({
    immediate: autoSearch,
    enableGeolocation: true,
  });

  const isSearchReady = locationSelection.location !== null;
  const searchLocation = locationSelection.location;

  return {
    ...locationSelection,
    searchRadius,
    setSearchRadius,
    searchLocation,
    isSearchReady,
  };
}

// Utility functions for working with location selections
export function formatLocationForDisplay(location: LocationSelection): string {
  return location.displayText;
}

export function getLocationCoordinates(
  location: LocationSelection,
): Coordinates {
  return location.coordinates;
}

export function isLocationFromGeolocation(
  location: LocationSelection,
): boolean {
  return location.source === "geolocation";
}

export function isLocationFromAddress(location: LocationSelection): boolean {
  return location.source === "address";
}

export function isLocationFromZipCode(location: LocationSelection): boolean {
  return location.source === "zipcode";
}

export function getLocationAddress(
  location: LocationSelection,
): Address | null {
  return location.address || null;
}

export function getLocationZipCode(location: LocationSelection): string | null {
  return location.zipCode || null;
}
