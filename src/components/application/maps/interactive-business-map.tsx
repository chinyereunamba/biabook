"use client";

import { useEffect, useState, useCallback } from "react";
import { BusinessMap, type BusinessLocation } from "./business-map";
import { LocationError } from "@/lib/location-validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Star, Clock } from "lucide-react";

export interface InteractiveBusinessMapProps {
  businesses: BusinessLocation[];
  center: google.maps.LatLngLiteral;
  zoom?: number;
  className?: string;
  onBusinessSelect?: (business: BusinessLocation) => void;
  onBookingClick?: (business: BusinessLocation) => void;
  onMapError?: (error: LocationError) => void;
  showUserLocation?: boolean;
  userLocation?: google.maps.LatLngLiteral;
}

export function InteractiveBusinessMap({
  businesses,
  center,
  zoom = 12,
  className,
  onBusinessSelect,
  onBookingClick,
  onMapError,
  showUserLocation = false,
  userLocation,
}: InteractiveBusinessMapProps) {
  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessLocation | null>(null);

  const handleBusinessSelect = useCallback(
    (business: BusinessLocation) => {
      setSelectedBusiness(business);
      onBusinessSelect?.(business);
    },
    [onBusinessSelect],
  );

  const handleGetDirections = useCallback(
    (business: BusinessLocation) => {
      const destination = `${business.coordinates.latitude},${business.coordinates.longitude}`;
      const origin = userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : business.address;

      // Try to open in device's default navigation app
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );

      if (isMobile) {
        // For mobile devices, try to open in native maps app
        const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
        const appleMapsUrl = `http://maps.apple.com/?daddr=${destination}&saddr=${encodeURIComponent(origin)}`;

        // Try Apple Maps first on iOS, Google Maps otherwise
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const mapsUrl = isIOS ? appleMapsUrl : googleMapsUrl;

        window.open(mapsUrl, "_blank");
      } else {
        // For desktop, open Google Maps in new tab
        const googleMapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
        window.open(googleMapsUrl, "_blank");
      }
    },
    [userLocation],
  );

  const handleBooking = useCallback(
    (business: BusinessLocation) => {
      onBookingClick?.(business);
    },
    [onBookingClick],
  );

  // Listen for custom business selection events from info windows
  useEffect(() => {
    const handleCustomBusinessSelect = (event: CustomEvent) => {
      const businessId = event.detail;
      const business = businesses.find((b) => b.id === businessId);
      if (business) {
        handleBusinessSelect(business);
      }
    };

    window.addEventListener(
      "selectBusiness",
      handleCustomBusinessSelect as EventListener,
    );

    return () => {
      window.removeEventListener(
        "selectBusiness",
        handleCustomBusinessSelect as EventListener,
      );
    };
  }, [businesses, handleBusinessSelect]);

  return (
    <div className={`flex flex-col gap-4 lg:flex-row ${className}`}>
      {/* Map Container */}
      <div className="flex-1">
        <BusinessMap
          businesses={businesses}
          center={center}
          zoom={zoom}
          className="h-96 w-full lg:h-[600px]"
          onBusinessSelect={handleBusinessSelect}
          onMapError={onMapError}
          showUserLocation={showUserLocation}
          userLocation={userLocation}
        />
      </div>

      {/* Business Details Sidebar */}
      {selectedBusiness && (
        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedBusiness.name}
                  </h3>
                  {selectedBusiness.rating && (
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {selectedBusiness.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBusiness(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedBusiness.address}
                  </p>
                  {selectedBusiness.distance && (
                    <p className="mt-1 text-xs text-gray-500">
                      {selectedBusiness.distance.toFixed(1)} miles away
                    </p>
                  )}
                </div>
              </div>

              {/* Services */}
              {selectedBusiness.services &&
                selectedBusiness.services.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Services
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBusiness.services
                        .slice(0, 4)
                        .map((service, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      {selectedBusiness.services.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedBusiness.services.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => handleBooking(selectedBusiness)}
                  className="w-full"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGetDirections(selectedBusiness)}
                  className="w-full"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-2">
                <p className="text-xs text-gray-500">
                  Click on other map markers to view more businesses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Selection State */}
      {!selectedBusiness && businesses.length > 0 && (
        <div className="w-full lg:w-80">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm">
                  Click on a map marker to view business details
                </p>
                <p className="mt-1 text-xs">
                  Found {businesses.length} business
                  {businesses.length !== 1 ? "es" : ""} in this area
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
