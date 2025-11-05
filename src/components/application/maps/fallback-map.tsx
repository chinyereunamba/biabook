"use client";

import { useState, useCallback } from "react";
import type { BusinessLocation } from "./business-map";
import { LocationError, LocationErrorCode } from "@/lib/location-validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export interface FallbackMapProps {
  businesses: BusinessLocation[];
  center: google.maps.LatLngLiteral;
  className?: string;
  onBusinessSelect?: (business: BusinessLocation) => void;
  onRetryMap?: () => void;
  onUseOpenStreetMap?: () => void;
  error?: LocationError | null;
  showOpenStreetMap?: boolean;
}

export function FallbackMap({
  businesses,
  center,
  className,
  onBusinessSelect,
  onRetryMap,
  onUseOpenStreetMap,
  error,
  showOpenStreetMap = true,
}: FallbackMapProps) {
  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessLocation | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleBusinessSelect = useCallback(
    (business: BusinessLocation) => {
      setSelectedBusiness(business);
      onBusinessSelect?.(business);
    },
    [onBusinessSelect],
  );

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetryMap?.();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetryMap]);

  const handleGetDirections = useCallback((business: BusinessLocation) => {
    const destination = `${business.coordinates.latitude},${business.coordinates.longitude}`;
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const mapsUrl = isIOS
        ? `http://maps.apple.com/?daddr=${destination}&dirflg=d`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      window.open(mapsUrl, "_blank");
    } else {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      window.open(googleMapsUrl, "_blank");
    }
  }, []);

  const openInOpenStreetMap = useCallback(
    (business?: BusinessLocation) => {
      const lat = business?.coordinates.latitude || center.lat;
      const lng = business?.coordinates.longitude || center.lng;
      const zoom = business ? 16 : 12;

      const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=${zoom}`;
      window.open(osmUrl, "_blank");
    },
    [center],
  );

  const getErrorMessage = useCallback(() => {
    if (!error) return "Map is temporarily unavailable";

    switch (error.code) {
      case LocationErrorCode.MAP_LOADING_FAILED:
        return "Unable to load interactive map";
      case LocationErrorCode.GEOLOCATION_DENIED:
        return "Location access denied";
      case LocationErrorCode.GEOLOCATION_UNAVAILABLE:
        return "Location services unavailable";
      default:
        return error.message || "Map service error";
    }
  }, [error]);

  const getErrorSuggestion = useCallback(() => {
    if (!error) return "Please check your internet connection and try again";

    switch (error.code) {
      case LocationErrorCode.MAP_LOADING_FAILED:
        return "Check your internet connection or try refreshing the page";
      case LocationErrorCode.GEOLOCATION_DENIED:
        return "Enable location access in your browser settings";
      case LocationErrorCode.GEOLOCATION_UNAVAILABLE:
        return "Try using a different device or browser";
      default:
        return error.fallbackAction || "Try refreshing the page";
    }
  }, [error]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
            <div className="flex-1">
              <h3 className="mb-1 font-medium text-orange-900">
                {getErrorMessage()}
              </h3>
              <p className="mb-3 text-sm text-orange-700">
                {getErrorSuggestion()}
              </p>
              <div className="flex flex-wrap gap-2">
                {onRetryMap && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    {isRetrying ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Retry Map
                  </Button>
                )}
                {showOpenStreetMap && onUseOpenStreetMap && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUseOpenStreetMap}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Use Alternative Map
                  </Button>
                )}
                {showOpenStreetMap && !onUseOpenStreetMap && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInOpenStreetMap()}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in OpenStreetMap
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <Card
            key={business.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedBusiness?.id === business.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => handleBusinessSelect(business)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start justify-between text-base">
                <span className="pr-2">{business.name}</span>
                {business.rating && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {business.rating.toFixed(1)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{business.address}</p>
                  {business.distance && (
                    <p className="mt-1 text-xs text-gray-500">
                      {business.distance.toFixed(1)} miles away
                    </p>
                  )}
                </div>
              </div>

              {/* Services */}
              {business.services && business.services.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {business.services.slice(0, 3).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {business.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{business.services.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetDirections(business);
                  }}
                  className="flex-1"
                >
                  <Navigation className="mr-1 h-3 w-3" />
                  Directions
                </Button>
                {showOpenStreetMap && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInOpenStreetMap(business);
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Businesses Found */}
      {businesses.length === 0 && (
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center text-gray-500">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No businesses found
              </h3>
              <p className="text-sm">
                Try expanding your search area or adjusting your filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Business Details */}
      {selectedBusiness && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Business</span>
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
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedBusiness.name}
                </h3>
                {selectedBusiness.rating && (
                  <p className="text-sm text-gray-600">
                    ⭐ {selectedBusiness.rating.toFixed(1)} rating
                  </p>
                )}
              </div>

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

              {selectedBusiness.services &&
                selectedBusiness.services.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Services
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBusiness.services.map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleGetDirections(selectedBusiness)}
                  className="flex-1"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
                {showOpenStreetMap && (
                  <Button
                    variant="outline"
                    onClick={() => openInOpenStreetMap(selectedBusiness)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
