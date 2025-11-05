"use client";

import { useState, useCallback, useEffect } from "react";
import { EnhancedBusinessMap } from "./enhanced-business-map";
import { FallbackMap } from "./fallback-map";
import { OpenStreetMap } from "./openstreetmap";
import type { BusinessLocation } from "./business-map";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";
import { env } from "@/env";

export interface MapContainerProps {
  businesses: BusinessLocation[];
  center: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  onBusinessSelect?: (business: BusinessLocation) => void;
  onBusinessHover?: (business: BusinessLocation | null) => void;
  showUserLocation?: boolean;
  userLocation?: google.maps.LatLngLiteral;
  selectedBusinessId?: string;
  enableClustering?: boolean;
  maxZoom?: number;
  fallbackMode?: boolean;
  retryAttempts?: number;
  useOpenStreetMapFallback?: boolean;
}

export function MapContainer({
  businesses,
  center,
  zoom = 12,
  className,
  onBusinessSelect,
  onBusinessHover,
  showUserLocation = false,
  userLocation,
  selectedBusinessId,
  enableClustering = true,
  maxZoom = 18,
  fallbackMode = false,
  retryAttempts = 2,
  useOpenStreetMapFallback = true,
}: MapContainerProps) {
  const [mapError, setMapError] = useState<LocationError | null>(null);
  const [isInFallbackMode, setIsInFallbackMode] = useState(fallbackMode);
  const [useOpenStreetMap, setUseOpenStreetMap] = useState(false);
  const [currentRetryAttempt, setCurrentRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Check if Google Maps API is available
  const isGoogleMapsAvailable = useCallback(() => {
    return !!(
      env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && typeof window !== "undefined"
    );
  }, []);

  // Handle map errors and decide whether to fallback
  const handleMapError = useCallback(
    (error: LocationError) => {
      console.warn("Map error occurred:", error);
      setMapError(error);

      // Determine if we should fallback based on error type
      const shouldFallback =
        error.code === LocationErrorCode.MAP_LOADING_FAILED ||
        error.code === LocationErrorCode.GEOCODING_FAILED ||
        currentRetryAttempt >= retryAttempts;

      if (shouldFallback) {
        setIsInFallbackMode(true);
      }
    },
    [currentRetryAttempt, retryAttempts],
  );

  // Retry loading the map
  const handleRetryMap = useCallback(async () => {
    if (currentRetryAttempt >= retryAttempts) {
      return;
    }

    setIsRetrying(true);
    setCurrentRetryAttempt((prev) => prev + 1);

    try {
      // Clear previous error
      setMapError(null);

      // Try to reload the map by temporarily switching modes
      setIsInFallbackMode(false);

      // Wait a bit for the component to re-render
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Retry failed:", error);
      const locationError = new LocationError(
        LocationErrorCode.MAP_LOADING_FAILED,
        "Failed to reload map after retry",
        "Please try refreshing the page",
      );
      handleMapError(locationError);
    } finally {
      setIsRetrying(false);
    }
  }, [currentRetryAttempt, retryAttempts, handleMapError]);

  // Initialize fallback mode if Google Maps is not available
  useEffect(() => {
    if (!isGoogleMapsAvailable() && !isInFallbackMode) {
      const error = new LocationError(
        LocationErrorCode.MAP_LOADING_FAILED,
        "Google Maps API not configured",
        "Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable",
      );
      setMapError(error);
      setIsInFallbackMode(true);
    }
  }, [isGoogleMapsAvailable, isInFallbackMode]);

  // Reset retry attempts when businesses change
  useEffect(() => {
    setCurrentRetryAttempt(0);
  }, [businesses]);

  // Handle OpenStreetMap fallback
  const handleUseOpenStreetMap = useCallback(() => {
    setUseOpenStreetMap(true);
    setIsInFallbackMode(false);
  }, []);

  // Render appropriate map component
  if (useOpenStreetMap && useOpenStreetMapFallback) {
    return (
      <OpenStreetMap
        businesses={businesses}
        center={[center.lat, center.lng]}
        zoom={zoom}
        className={className}
        onBusinessSelect={onBusinessSelect}
        onMapError={handleMapError}
        showUserLocation={showUserLocation}
        userLocation={
          userLocation ? [userLocation.lat, userLocation.lng] : undefined
        }
      />
    );
  }

  if (isInFallbackMode || !isGoogleMapsAvailable()) {
    return (
      <FallbackMap
        businesses={businesses}
        center={center}
        className={className}
        onBusinessSelect={onBusinessSelect}
        onRetryMap={
          currentRetryAttempt < retryAttempts ? handleRetryMap : undefined
        }
        onUseOpenStreetMap={
          useOpenStreetMapFallback ? handleUseOpenStreetMap : undefined
        }
        error={mapError}
        showOpenStreetMap={useOpenStreetMapFallback}
      />
    );
  }

  return (
    <EnhancedBusinessMap
      businesses={businesses}
      center={center}
      zoom={zoom}
      className={className}
      onBusinessSelect={onBusinessSelect}
      onBusinessHover={onBusinessHover}
      onMapError={handleMapError}
      showUserLocation={showUserLocation}
      userLocation={userLocation}
      selectedBusinessId={selectedBusinessId}
      enableClustering={enableClustering}
      maxZoom={maxZoom}
    />
  );
}

// Hook for managing map container state
export function useMapContainer() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  );
  const [hoveredBusiness, setHoveredBusiness] =
    useState<BusinessLocation | null>(null);
  const [mapError, setMapError] = useState<LocationError | null>(null);

  const selectBusiness = useCallback((business: BusinessLocation | null) => {
    setSelectedBusinessId(business?.id || null);
  }, []);

  const hoverBusiness = useCallback((business: BusinessLocation | null) => {
    setHoveredBusiness(business);
  }, []);

  const clearError = useCallback(() => {
    setMapError(null);
  }, []);

  return {
    selectedBusinessId,
    hoveredBusiness,
    mapError,
    selectBusiness,
    hoverBusiness,
    clearError,
    setMapError,
  };
}
