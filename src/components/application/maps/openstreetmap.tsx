"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { BusinessLocation } from "./business-map";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export interface OpenStreetMapProps {
  businesses: BusinessLocation[];
  center: [number, number]; // Leaflet uses [lat, lng] format
  zoom?: number;
  className?: string;
  onBusinessSelect?: (business: BusinessLocation) => void;
  onMapError?: (error: LocationError) => void;
  showUserLocation?: boolean;
  userLocation?: [number, number];
}

export function OpenStreetMap({
  businesses,
  center,
  zoom = 12,
  className = "h-96 w-full",
  onBusinessSelect,
  onMapError,
  showUserLocation = false,
  userLocation,
}: OpenStreetMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  // Handle map loading
  useEffect(() => {
    const loadLeafletCSS = () => {
      if (typeof window === "undefined") return;

      // Check if Leaflet CSS is already loaded
      const existingLink = document.querySelector('link[href*="leaflet.css"]');
      if (existingLink) {
        setIsLoaded(true);
        return;
      }

      // Load Leaflet CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";

      link.onload = () => setIsLoaded(true);
      link.onerror = () => {
        const error = new LocationError(
          LocationErrorCode.MAP_LOADING_FAILED,
          "Failed to load OpenStreetMap styles",
          "Please check your internet connection",
        );
        setError(error);
        onMapError?.(error);
      };

      document.head.appendChild(link);
    };

    loadLeafletCSS();
  }, [onMapError]);

  const handleBusinessClick = useCallback(
    (business: BusinessLocation) => {
      onBusinessSelect?.(business);
    },
    [onBusinessSelect],
  );

  const createBusinessIcon = useCallback(() => {
    if (typeof window === "undefined") return null;

    const L = require("leaflet");

    return L.divIcon({
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #3B82F6;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: "custom-business-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  const createUserIcon = useCallback(() => {
    if (typeof window === "undefined") return null;

    const L = require("leaflet");

    return L.divIcon({
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #EF4444;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <div style="
            width: 6px;
            height: 6px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: "custom-user-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, []);

  if (error) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border bg-gray-100`}
      >
        <div className="p-4 text-center">
          <p className="mb-2 text-sm text-gray-600">
            Alternative map unavailable
          </p>
          <p className="text-xs text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg bg-gray-100`}
      >
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading alternative map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Business Markers */}
        {businesses.map((business) => (
          <Marker
            key={business.id}
            position={[
              business.coordinates.latitude,
              business.coordinates.longitude,
            ]}
            icon={createBusinessIcon()}
            eventHandlers={{
              click: () => handleBusinessClick(business),
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <h3 className="mb-1 text-base font-semibold">
                  {business.name}
                </h3>
                <p className="mb-2 text-sm text-gray-600">{business.address}</p>
                {business.rating && (
                  <p className="mb-1 text-sm">
                    ⭐ {business.rating.toFixed(1)}
                  </p>
                )}
                {business.distance && (
                  <p className="mb-2 text-sm">
                    📍 {business.distance.toFixed(1)} miles
                  </p>
                )}
                {business.services && business.services.length > 0 && (
                  <p className="mb-2 text-xs text-gray-500">
                    {business.services.slice(0, 3).join(", ")}
                  </p>
                )}
                <button
                  className="w-full rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                  onClick={() => handleBusinessClick(business)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>
              <div className="p-2">
                <p className="text-sm font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
