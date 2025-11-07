/**
 * Google Maps component for the maps directory
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { env } from "@/env";
import type { Coordinates } from "@/types/location";

export interface GoogleMapProps {
  center: Coordinates;
  zoom?: number;
  markers?: Array<{
    position: Coordinates;
    title: string;
    info?: string;
  }>;
  onMapClick?: (coordinates: Coordinates) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function GoogleMap({
  center,
  zoom = 14,
  markers = [],
  onMapClick,
  onLoad,
  onError,
  className = "h-full w-full",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);

        const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error("Google Maps API key not configured");
        }

        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places", "geometry"],
        });

        // Load the Google Maps API
        await (loader as any).load();

        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: {
            lat: center.latitude,
            lng: center.longitude,
          },
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

        // Add click listener
        if (onMapClick) {
          mapInstance.addListener(
            "click",
            (event: google.maps.MapMouseEvent) => {
              if (event.latLng) {
                onMapClick({
                  latitude: event.latLng.lat(),
                  longitude: event.latLng.lng(),
                });
              }
            },
          );
        }

        setMap(mapInstance);
        onLoad?.();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load Google Maps");
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center.latitude, center.longitude, zoom, onMapClick, onLoad, onError]);

  // Update markers when they change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: {
          lat: markerData.position.latitude,
          lng: markerData.position.longitude,
        },
        map,
        title: markerData.title,
      });

      // Add info window if info is provided
      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${markerData.title}</h3>
              <p style="margin: 0;">${markerData.info}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [map, markers]);

  // Update map center when it changes
  useEffect(() => {
    if (!map) return;

    map.setCenter({
      lat: center.latitude,
      lng: center.longitude,
    });
  }, [map, center.latitude, center.longitude]);

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
