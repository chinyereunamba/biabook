"use client";

import { useState, useCallback } from "react";
import type { BusinessLocation } from "@/components/application/maps/business-map";

export interface MapInteractionState {
  selectedBusiness: BusinessLocation | null;
  isDirectionsOpen: boolean;
  isBookingModalOpen: boolean;
}

export function useMapInteractions() {
  const [state, setState] = useState<MapInteractionState>({
    selectedBusiness: null,
    isDirectionsOpen: false,
    isBookingModalOpen: false,
  });

  const selectBusiness = useCallback((business: BusinessLocation | null) => {
    setState((prev) => ({
      ...prev,
      selectedBusiness: business,
    }));
  }, []);

  const openDirections = useCallback((business: BusinessLocation) => {
    const destination = `${business.coordinates.latitude},${business.coordinates.longitude}`;

    // Detect device type and preferred maps app
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    let mapsUrl: string;

    if (isMobile) {
      if (isIOS) {
        // Try Apple Maps first on iOS
        mapsUrl = `http://maps.apple.com/?daddr=${destination}&dirflg=d`;
      } else {
        // Use Google Maps on Android
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      }
    } else {
      // Desktop - use Google Maps
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    }

    setState((prev) => ({
      ...prev,
      isDirectionsOpen: true,
    }));

    // Open in new tab/app
    window.open(mapsUrl, "_blank");

    // Reset directions state after a short delay
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isDirectionsOpen: false,
      }));
    }, 1000);
  }, []);

  const openBookingModal = useCallback((business: BusinessLocation) => {
    setState((prev) => ({
      ...prev,
      isBookingModalOpen: true,
      selectedBusiness: business,
    }));
  }, []);

  const closeBookingModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isBookingModalOpen: false,
    }));
  }, []);

  const getDirectionsUrl = useCallback(
    (business: BusinessLocation, userLocation?: google.maps.LatLngLiteral) => {
      const destination = `${business.coordinates.latitude},${business.coordinates.longitude}`;
      const origin = userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : "";

      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isMobile) {
        if (isIOS) {
          return origin
            ? `http://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`
            : `http://maps.apple.com/?daddr=${destination}&dirflg=d`;
        } else {
          return origin
            ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
            : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
        }
      } else {
        return origin
          ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
          : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      }
    },
    [],
  );

  const shareLocation = useCallback((business: BusinessLocation) => {
    const shareData = {
      title: business.name,
      text: `Check out ${business.name} at ${business.address}`,
      url: `https://www.google.com/maps/search/?api=1&query=${business.coordinates.latitude},${business.coordinates.longitude}`,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(
          `${business.name}\n${business.address}\nhttps://www.google.com/maps/search/?api=1&query=${business.coordinates.latitude},${business.coordinates.longitude}`,
        )
        .then(() => {
          // Could show a toast notification here
          console.log("Location copied to clipboard");
        })
        .catch(console.error);
    }
  }, []);

  return {
    ...state,
    selectBusiness,
    openDirections,
    openBookingModal,
    closeBookingModal,
    getDirectionsUrl,
    shareLocation,
  };
}
