"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  geolocationService,
  type GeolocationOptions,
  type LocationPermissionStatus,
} from "@/lib/geolocation-service";
import type { Coordinates } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";

export interface UseGeolocationOptions extends GeolocationOptions {
  watch?: boolean;
  immediate?: boolean;
}

export interface UseGeolocationResult {
  coordinates: Coordinates | null;
  error: LocationError | null;
  isLoading: boolean;
  isSupported: boolean;
  permissionStatus: LocationPermissionStatus | null;
  getCurrentLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  clearError: () => void;
  clearLocation: () => void;
}

export function useGeolocation(
  options: UseGeolocationOptions = {},
): UseGeolocationResult {
  const {
    watch = false,
    immediate = false,
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 300000,
  } = options;

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const isSupported = geolocationService.isSupported();

  // Check permission status on mount
  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const status = await geolocationService.getPermissionStatus();
        if (mountedRef.current) {
          setPermissionStatus(status);
        }
      } catch (err) {
        console.warn("Failed to check permission status:", err);
      }
    };

    checkPermissionStatus();
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!isSupported) {
      const error = new Error("Geolocation is not supported") as LocationError;
      error.code = LocationErrorCode.GEOLOCATION_UNAVAILABLE;
      error.fallbackAction = "Please enter your location manually";
      setError(error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const coords = await geolocationService.getCurrentLocation({
        enableHighAccuracy,
        timeout,
        maximumAge,
      });

      if (mountedRef.current) {
        setCoordinates(coords);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as LocationError);
        setCoordinates(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isSupported, enableHighAccuracy, timeout, maximumAge]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const granted = await geolocationService.requestLocationPermission();

      // Update permission status
      const status = await geolocationService.getPermissionStatus();
      if (mountedRef.current) {
        setPermissionStatus(status);
      }

      return granted;
    } catch (err) {
      if (mountedRef.current) {
        setError(err as LocationError);
      }
      return false;
    }
  }, [isSupported]);

  // Watch position
  const startWatching = useCallback(() => {
    if (!isSupported || watchIdRef.current !== null) {
      return;
    }

    const watchId = geolocationService.watchPosition(
      (coords) => {
        if (mountedRef.current) {
          setCoordinates(coords);
          setError(null);
          setIsLoading(false);
        }
      },
      (err) => {
        if (mountedRef.current) {
          setError(err);
          setIsLoading(false);
        }
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    );

    watchIdRef.current = watchId;
  }, [isSupported, enableHighAccuracy, timeout, maximumAge]);

  // Stop watching
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      geolocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear location
  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
  }, []);

  // Handle immediate location request
  useEffect(() => {
    if (immediate && isSupported) {
      getCurrentLocation();
    }
  }, [immediate, isSupported, getCurrentLocation]);

  // Handle watching
  useEffect(() => {
    if (watch && isSupported) {
      setIsLoading(true);
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [watch, isSupported, startWatching, stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopWatching();
    };
  }, [stopWatching]);

  return {
    coordinates,
    error,
    isLoading,
    isSupported,
    permissionStatus,
    getCurrentLocation,
    requestPermission,
    clearError,
    clearLocation,
  };
}

// Hook for getting location with user-friendly error handling
export function useGeolocationWithFallback() {
  const [result, setResult] = useState<{
    coordinates?: Coordinates;
    error?: LocationError;
    requiresManualEntry: boolean;
    isLoading: boolean;
  }>({
    requiresManualEntry: false,
    isLoading: false,
  });

  const getLocationWithFallback = useCallback(async () => {
    setResult((prev) => ({ ...prev, isLoading: true }));

    try {
      const locationResult = await geolocationService.getLocationWithFallback();
      setResult({
        ...locationResult,
        isLoading: false,
      });
    } catch (err) {
      setResult({
        error: err as LocationError,
        requiresManualEntry: true,
        isLoading: false,
      });
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult({
      requiresManualEntry: false,
      isLoading: false,
    });
  }, []);

  return {
    ...result,
    getLocationWithFallback,
    clearResult,
  };
}
