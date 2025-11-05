"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { GoogleMap } from "./google-map";
import { LocationError } from "@/lib/location-validation";
import type { BusinessLocation } from "./business-map";

export interface EnhancedBusinessMapProps {
  businesses: BusinessLocation[];
  center: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  onBusinessSelect?: (business: BusinessLocation) => void;
  onBusinessHover?: (business: BusinessLocation | null) => void;
  onMapError?: (error: LocationError) => void;
  showUserLocation?: boolean;
  userLocation?: google.maps.LatLngLiteral;
  selectedBusinessId?: string;
  enableClustering?: boolean;
  maxZoom?: number;
}

export function EnhancedBusinessMap({
  businesses,
  center,
  zoom = 12,
  className,
  onBusinessSelect,
  onBusinessHover,
  onMapError,
  showUserLocation = false,
  userLocation,
  selectedBusinessId,
  enableClustering = true,
  maxZoom = 18,
}: EnhancedBusinessMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Map<string, google.maps.Marker>>(
    new Map(),
  );
  const [markerClusterer, setMarkerClusterer] =
    useState<MarkerClusterer | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] =
    useState<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Create custom marker icons
  const createMarkerIcon = useCallback(
    (isSelected: boolean = false, isHovered: boolean = false) => {
      const color = isSelected ? "#EF4444" : isHovered ? "#F59E0B" : "#3B82F6";
      const size = isSelected || isHovered ? 36 : 32;

      return {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
          ${isSelected ? '<circle cx="16" cy="16" r="3" fill="' + color + '"/>' : ""}
        </svg>
      `),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(size / 2, size / 2),
      };
    },
    [],
  );

  // Create user location marker icon
  const createUserMarkerIcon = useCallback(() => {
    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
          <circle cx="12" cy="12" r="2" fill="#EF4444"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12),
    };
  }, []);

  // Create enhanced info window content
  const createInfoWindowContent = useCallback(
    (business: BusinessLocation): string => {
      const rating = business.rating ? `⭐ ${business.rating.toFixed(1)}` : "";
      const distance = business.distance
        ? `📍 ${business.distance.toFixed(1)} miles`
        : "";
      const services = business.services?.slice(0, 2).join(", ") || "";

      return `
      <div class="p-4 min-w-[250px] max-w-[300px]">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-lg text-gray-900 pr-2">${business.name}</h3>
          ${rating ? `<span class="text-sm text-gray-600 whitespace-nowrap">${rating}</span>` : ""}
        </div>
        <p class="text-sm text-gray-600 mb-2">${business.address}</p>
        ${distance ? `<p class="text-sm text-gray-500 mb-2">${distance}</p>` : ""}
        ${services ? `<p class="text-xs text-gray-500 mb-3 border-t pt-2">${services}</p>` : ""}
        <div class="flex gap-2">
          <button 
            class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            onclick="window.dispatchEvent(new CustomEvent('selectBusiness', { detail: '${business.id}' }))"
          >
            View Details
          </button>
          <button 
            class="px-3 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
            onclick="window.dispatchEvent(new CustomEvent('getDirections', { detail: '${business.id}' }))"
          >
            Directions
          </button>
        </div>
      </div>
    `;
    },
    [],
  );

  // Update markers when businesses change
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers and clusterer
    markersRef.current.forEach((marker) => marker.setMap(null));
    markerClusterer?.clearMarkers();
    activeInfoWindow?.close();

    const newMarkers = new Map<string, google.maps.Marker>();

    businesses.forEach((business) => {
      const isSelected = business.id === selectedBusinessId;

      const marker = new google.maps.Marker({
        position: {
          lat: business.coordinates.latitude,
          lng: business.coordinates.longitude,
        },
        map,
        title: business.name,
        icon: createMarkerIcon(isSelected),
        zIndex: isSelected ? 1000 : 1,
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(business),
        maxWidth: 300,
      });

      // Add click listener
      marker.addListener("click", () => {
        // Close other info windows
        if (activeInfoWindow && activeInfoWindow !== infoWindow) {
          activeInfoWindow.close();
        }

        infoWindow.open(map, marker);
        setActiveInfoWindow(infoWindow);
        onBusinessSelect?.(business);
      });

      // Add hover listeners
      marker.addListener("mouseover", () => {
        if (business.id !== selectedBusinessId) {
          marker.setIcon(createMarkerIcon(false, true));
        }
        onBusinessHover?.(business);
      });

      marker.addListener("mouseout", () => {
        if (business.id !== selectedBusinessId) {
          marker.setIcon(createMarkerIcon(false, false));
        }
        onBusinessHover?.(null);
      });

      // Store references
      (marker as any).infoWindow = infoWindow;
      (marker as any).businessId = business.id;
      newMarkers.set(business.id, marker);
    });

    markersRef.current = newMarkers;
    setMarkers(newMarkers);

    // Initialize marker clusterer if enabled
    if (enableClustering && newMarkers.size > 0) {
      const clusterer = new MarkerClusterer({
        map,
        markers: Array.from(newMarkers.values()),
        algorithm: new (MarkerClusterer as any).GridAlgorithm({
          gridSize: 60,
          maxZoom: Math.min(maxZoom - 2, 15),
        }),
      });
      setMarkerClusterer(clusterer);
    }
  }, [
    map,
    businesses,
    selectedBusinessId,
    createMarkerIcon,
    createInfoWindowContent,
    onBusinessSelect,
    onBusinessHover,
    enableClustering,
    maxZoom,
    markerClusterer,
    activeInfoWindow,
  ]);

  // Update selected marker appearance
  useEffect(() => {
    markersRef.current.forEach((marker, businessId) => {
      const isSelected = businessId === selectedBusinessId;
      marker.setIcon(createMarkerIcon(isSelected));
      marker.setZIndex(isSelected ? 1000 : 1);
    });
  }, [selectedBusinessId, createMarkerIcon]);

  // Handle user location marker
  useEffect(() => {
    if (!map || !showUserLocation || !userLocation) {
      if (userMarker) {
        userMarker.setMap(null);
        setUserMarker(null);
      }
      return;
    }

    if (userMarker) {
      userMarker.setPosition(userLocation);
    } else {
      const marker = new google.maps.Marker({
        position: userLocation,
        map,
        title: "Your Location",
        icon: createUserMarkerIcon(),
        zIndex: 999,
      });
      setUserMarker(marker);
    }
  }, [map, showUserLocation, userLocation, userMarker, createUserMarkerIcon]);

  // Listen for custom events from info windows
  useEffect(() => {
    const handleSelectBusiness = (event: CustomEvent) => {
      const businessId = event.detail;
      const business = businesses.find((b) => b.id === businessId);
      if (business) {
        onBusinessSelect?.(business);
      }
    };

    const handleGetDirections = (event: CustomEvent) => {
      const businessId = event.detail;
      const business = businesses.find((b) => b.id === businessId);
      if (business) {
        // Dispatch directions event
        window.dispatchEvent(
          new CustomEvent("openDirections", { detail: business }),
        );
      }
    };

    window.addEventListener(
      "selectBusiness",
      handleSelectBusiness as EventListener,
    );
    window.addEventListener(
      "getDirections",
      handleGetDirections as EventListener,
    );

    return () => {
      window.removeEventListener(
        "selectBusiness",
        handleSelectBusiness as EventListener,
      );
      window.removeEventListener(
        "getDirections",
        handleGetDirections as EventListener,
      );
    };
  }, [businesses, onBusinessSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markerClusterer?.clearMarkers();
      userMarker?.setMap(null);
      activeInfoWindow?.close();
    };
  }, [markerClusterer, userMarker, activeInfoWindow]);

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
