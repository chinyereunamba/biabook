"use client";

import { useEffect, useState, useCallback } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { GoogleMap } from "./google-map";
import { LocationError } from "@/lib/location-validation";

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  distance?: number;
  services?: string[];
}

export interface BusinessMapProps {
  businesses: BusinessLocation[];
  center: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  onBusinessSelect?: (business: BusinessLocation) => void;
  onMapError?: (error: LocationError) => void;
  showUserLocation?: boolean;
  userLocation?: google.maps.LatLngLiteral;
}

export function BusinessMap({
  businesses,
  center,
  zoom = 12,
  className,
  onBusinessSelect,
  onMapError,
  showUserLocation = false,
  userLocation,
}: BusinessMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [markerClusterer, setMarkerClusterer] =
    useState<MarkerClusterer | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Create business markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    markerClusterer?.clearMarkers();

    const newMarkers: google.maps.Marker[] = [];

    businesses.forEach((business) => {
      const marker = new google.maps.Marker({
        position: {
          lat: business.coordinates.latitude,
          lng: business.coordinates.longitude,
        },
        map,
        title: business.name,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        },
      });

      // Create info window for business details
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(business),
      });

      marker.addListener("click", () => {
        // Close other info windows
        markers.forEach((m) => {
          const existingInfoWindow = (m as any).infoWindow;
          if (existingInfoWindow) {
            existingInfoWindow.close();
          }
        });

        infoWindow.open(map, marker);
        onBusinessSelect?.(business);
      });

      // Store info window reference on marker
      (marker as any).infoWindow = infoWindow;
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Initialize marker clusterer
    if (newMarkers.length > 0) {
      const clusterer = new MarkerClusterer({
        map,
        markers: newMarkers,
        algorithm: new (MarkerClusterer as any).GridAlgorithm({ gridSize: 60 }),
      });
      setMarkerClusterer(clusterer);
    }
  }, [map, businesses, onBusinessSelect]);

  // Handle user location marker
  useEffect(() => {
    if (!map || !showUserLocation || !userLocation) return;

    // Remove existing user marker
    if (userMarker) {
      userMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
      position: userLocation,
      map,
      title: "Your Location",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#EF4444" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12),
      },
    });

    setUserMarker(marker);
  }, [map, showUserLocation, userLocation, userMarker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markers.forEach((marker) => marker.setMap(null));
      markerClusterer?.clearMarkers();
      userMarker?.setMap(null);
    };
  }, [markers, markerClusterer, userMarker]);

  return (
    <GoogleMap
      center={center}
      zoom={zoom}
      className={className}
      onMapLoad={handleMapLoad}
      onMapError={onMapError}
    />
  );
}

function createInfoWindowContent(business: BusinessLocation): string {
  const rating = business.rating ? `⭐ ${business.rating.toFixed(1)}` : "";
  const distance = business.distance
    ? `📍 ${business.distance.toFixed(1)} miles`
    : "";
  const services = business.services?.slice(0, 3).join(", ") || "";

  return `
    <div class="p-3 min-w-[200px]">
      <h3 class="font-semibold text-lg mb-1">${business.name}</h3>
      <p class="text-sm text-gray-600 mb-2">${business.address}</p>
      ${rating ? `<p class="text-sm mb-1">${rating}</p>` : ""}
      ${distance ? `<p class="text-sm mb-1">${distance}</p>` : ""}
      ${services ? `<p class="text-xs text-gray-500 mb-2">${services}</p>` : ""}
      <button 
        class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        onclick="window.dispatchEvent(new CustomEvent('selectBusiness', { detail: '${business.id}' }))"
      >
        View Details
      </button>
    </div>
  `;
}
