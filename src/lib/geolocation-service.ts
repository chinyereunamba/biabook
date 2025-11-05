/**
 * Geolocation Service
 * Handles browser geolocation API integration with permission handling and fallback methods
 */

import type { Coordinates, Address } from "@/types/location";
import {
  LocationError,
  LocationErrorCode,
  validateCoordinates,
} from "@/lib/location-validation";

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationPermissionStatus {
  state: "granted" | "denied" | "prompt";
  canRequest: boolean;
}

export class GeolocationService {
  private static instance: GeolocationService;
  private permissionStatus: LocationPermissionStatus | null = null;
  private lastKnownLocation: Coordinates | null = null;
  private locationWatchId: number | null = null;

  private constructor() {}

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Check if geolocation is supported by the browser
   */
  isSupported(): boolean {
    return "geolocation" in navigator;
  }

  /**
   * Check if permissions API is supported
   */
  isPermissionsAPISupported(): boolean {
    return "permissions" in navigator;
  }

  /**
   * Get current permission status for geolocation
   */
  async getPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!this.isSupported()) {
      return {
        state: "denied",
        canRequest: false,
      };
    }

    if (this.isPermissionsAPISupported()) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        this.permissionStatus = {
          state: permission.state as "granted" | "denied" | "prompt",
          canRequest: permission.state !== "denied",
        };
        return this.permissionStatus;
      } catch (error) {
        // Fallback if permissions query fails
        console.warn("Failed to query geolocation permission:", error);
      }
    }

    // Fallback: assume we can request if geolocation is supported
    return {
      state: "prompt",
      canRequest: true,
    };
  }

  /**
   * Request location permission from the user
   */
  async requestLocationPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw this.createLocationError(
        LocationErrorCode.GEOLOCATION_UNAVAILABLE,
        "Geolocation is not supported by this browser",
        "Please enter your location manually",
      );
    }

    const permissionStatus = await this.getPermissionStatus();

    if (permissionStatus.state === "granted") {
      return true;
    }

    if (permissionStatus.state === "denied") {
      throw this.createLocationError(
        LocationErrorCode.GEOLOCATION_DENIED,
        "Location access has been denied. Please enable location access in your browser settings.",
        "Enter your address or zip code manually",
      );
    }

    // Try to get location to trigger permission prompt
    try {
      await this.getCurrentLocationInternal({
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 0,
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("denied")) {
        throw this.createLocationError(
          LocationErrorCode.GEOLOCATION_DENIED,
          "Location access was denied by the user",
          "Enter your address or zip code manually",
        );
      }
      throw error;
    }
  }

  /**
   * Get current location with permission handling
   */
  async getCurrentLocation(
    options: GeolocationOptions = {},
  ): Promise<Coordinates> {
    if (!this.isSupported()) {
      throw this.createLocationError(
        LocationErrorCode.GEOLOCATION_UNAVAILABLE,
        "Geolocation is not supported by this browser",
        "Please enter your location manually",
      );
    }

    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // 5 minutes
      ...options,
    };

    try {
      const coordinates = await this.getCurrentLocationInternal(defaultOptions);
      this.lastKnownLocation = coordinates;
      return coordinates;
    } catch (error) {
      // Try fallback methods
      return this.tryFallbackMethods(error);
    }
  }

  /**
   * Get current location without fallback methods (internal use)
   */
  private getCurrentLocationInternal(
    options: GeolocationOptions,
  ): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          try {
            validateCoordinates(coordinates);
            resolve(coordinates);
          } catch (validationError) {
            reject(
              this.createLocationError(
                LocationErrorCode.INVALID_COORDINATES,
                `Invalid coordinates received: ${validationError instanceof Error ? validationError.message : "Unknown validation error"}`,
                "Try refreshing the page or enter location manually",
              ),
            );
          }
        },
        (error) => {
          reject(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge,
        },
      );
    });
  }

  /**
   * Try fallback methods when primary geolocation fails
   */
  private async tryFallbackMethods(
    originalError: unknown,
  ): Promise<Coordinates> {
    // Try to use last known location if available and not too old
    if (this.lastKnownLocation) {
      console.warn("Using last known location as fallback");
      return this.lastKnownLocation;
    }

    // Try with less accurate but faster options
    try {
      return await this.getCurrentLocationInternal({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 600000, // 10 minutes
      });
    } catch (fallbackError) {
      // If all methods fail, throw the original error
      throw originalError;
    }
  }

  /**
   * Watch position changes (for continuous location tracking)
   */
  watchPosition(
    onLocationUpdate: (coordinates: Coordinates) => void,
    onError: (error: LocationError) => void,
    options: GeolocationOptions = {},
  ): number {
    if (!this.isSupported()) {
      onError(
        this.createLocationError(
          LocationErrorCode.GEOLOCATION_UNAVAILABLE,
          "Geolocation is not supported by this browser",
          "Please enter your location manually",
        ),
      );
      return -1;
    }

    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000, // 1 minute for watch
      ...options,
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        try {
          validateCoordinates(coordinates);
          this.lastKnownLocation = coordinates;
          onLocationUpdate(coordinates);
        } catch (validationError) {
          onError(
            this.createLocationError(
              LocationErrorCode.INVALID_COORDINATES,
              `Invalid coordinates received: ${validationError instanceof Error ? validationError.message : "Unknown validation error"}`,
              "Try refreshing the page or enter location manually",
            ),
          );
        }
      },
      (error) => {
        onError(this.handleGeolocationError(error));
      },
      {
        enableHighAccuracy: defaultOptions.enableHighAccuracy,
        timeout: defaultOptions.timeout,
        maximumAge: defaultOptions.maximumAge,
      },
    );

    this.locationWatchId = watchId;
    return watchId;
  }

  /**
   * Stop watching position changes
   */
  clearWatch(watchId?: number): void {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      if (this.locationWatchId === watchId) {
        this.locationWatchId = null;
      }
    } else if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  /**
   * Get last known location (cached)
   */
  getLastKnownLocation(): Coordinates | null {
    return this.lastKnownLocation;
  }

  /**
   * Clear cached location data
   */
  clearCache(): void {
    this.lastKnownLocation = null;
    this.permissionStatus = null;
  }

  /**
   * Handle geolocation API errors
   */
  private handleGeolocationError(
    error: GeolocationPositionError,
  ): LocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return this.createLocationError(
          LocationErrorCode.GEOLOCATION_DENIED,
          "Location access was denied by the user",
          "Enter your address or zip code manually",
        );
      case error.POSITION_UNAVAILABLE:
        return this.createLocationError(
          LocationErrorCode.GEOLOCATION_UNAVAILABLE,
          "Location information is unavailable",
          "Check your internet connection or enter location manually",
        );
      case error.TIMEOUT:
        return this.createLocationError(
          LocationErrorCode.GEOLOCATION_UNAVAILABLE,
          "Location request timed out",
          "Try again or enter your location manually",
        );
      default:
        return this.createLocationError(
          LocationErrorCode.GEOLOCATION_UNAVAILABLE,
          `Geolocation error: ${error.message}`,
          "Enter your location manually",
        );
    }
  }

  /**
   * Create a LocationError with proper typing
   */
  private createLocationError(
    code: LocationErrorCode,
    message: string,
    fallbackAction?: string,
  ): LocationError {
    return new LocationError(code, message, fallbackAction);
  }

  /**
   * Check if location services are likely available
   * (useful for showing appropriate UI before requesting permission)
   */
  async isLocationLikelyAvailable(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    // Check if we're on HTTPS (required for geolocation in most browsers)
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      return false;
    }

    const permissionStatus = await this.getPermissionStatus();
    return permissionStatus.canRequest;
  }

  /**
   * Get location with user-friendly error handling
   */
  async getLocationWithFallback(): Promise<{
    coordinates?: Coordinates;
    error?: LocationError;
    requiresManualEntry: boolean;
  }> {
    try {
      const coordinates = await this.getCurrentLocation();
      return {
        coordinates,
        requiresManualEntry: false,
      };
    } catch (error) {
      const locationError = error as LocationError;
      return {
        error: locationError,
        requiresManualEntry: true,
      };
    }
  }
}

// Export singleton instance
export const geolocationService = GeolocationService.getInstance();
