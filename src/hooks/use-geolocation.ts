"use client";

import { useState, useEffect, useCallback } from "react";

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoRequest?: boolean;
}

interface UseGeolocationResult {
  location: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  hasPermission: boolean;
  clearError: () => void;
}

export function useGeolocation(
  options: GeolocationOptions = {},
): UseGeolocationResult {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    autoRequest = false,
  } = options;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by this browser";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const successCallback = (position: GeolocationPosition) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coords);
        setHasPermission(true);
        setLoading(false);
        resolve();
      };

      const errorCallback = (error: GeolocationPositionError) => {
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            setHasPermission(false);
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage =
              "An unknown error occurred while retrieving location";
            break;
        }

        setError(errorMessage);
        setLoading(false);
        reject(new Error(errorMessage));
      };

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Check for existing permission status
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setHasPermission(result.state === "granted");

          // Auto-request location if permission is already granted and autoRequest is true
          if (result.state === "granted" && autoRequest && !location) {
            requestLocation().catch(() => {
              // Silently handle auto-request failures
            });
          }
        })
        .catch(() => {
          // Permissions API not supported, try auto-request anyway if enabled
          if (autoRequest && !location) {
            requestLocation().catch(() => {
              // Silently handle auto-request failures
            });
          }
        });
    } else if (autoRequest && !location) {
      // Permissions API not supported, try auto-request anyway if enabled
      requestLocation().catch(() => {
        // Silently handle auto-request failures
      });
    }
  }, [autoRequest, location, requestLocation]);

  return {
    location,
    loading,
    error,
    requestLocation,
    hasPermission,
    clearError,
  };
}
