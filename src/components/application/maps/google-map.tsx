"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { env } from "@/env";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";

export interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
  onMapError?: (error: LocationError) => void;
}

export function GoogleMap({
  center,
  zoom = 12,
  className = "h-96 w-full",
  onMapLoad,
  onMapError,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<LocationError | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new LocationError(
            LocationErrorCode.MAP_LOADING_FAILED,
            "Google Maps API key not configured",
            "Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable",
          );
        }

        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places", "geometry"],
        });

        // Load the Google Maps API
        await (loader as any).load();

        const mapInstance = new google.maps.Map(mapRef.current!, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(mapInstance);
        onMapLoad?.(mapInstance);
      } catch (err) {
        const locationError =
          err instanceof LocationError
            ? err
            : new LocationError(
                LocationErrorCode.MAP_LOADING_FAILED,
                "Failed to load Google Maps",
                "Please check your internet connection and try again",
              );

        setError(locationError);
        onMapError?.(locationError);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center.lat, center.lng, zoom, onMapLoad, onMapError]);

  if (error) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border bg-gray-100`}
      >
        <div className="p-4 text-center">
          <p className="mb-2 text-sm text-gray-600">Map unavailable</p>
          <p className="text-xs text-gray-500">{error.message}</p>
          {error.fallbackAction && (
            <p className="mt-1 text-xs text-blue-600">{error.fallbackAction}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
