"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Clock,
  Navigation,
  Map,
  List,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EnhancedBusinessMap } from "@/components/application/maps/enhanced-business-map";
import type { BusinessSearchResult } from "@/server/services/proximity-search-service";
import type { Coordinates } from "@/types/location";
import { cn } from "@/lib/utils";

export interface LocationAwareBusinessListProps {
  businesses: BusinessSearchResult[];
  searchLocation?: Coordinates;
  searchRadius?: number;
  isLoading?: boolean;
  onBusinessSelect?: (business: BusinessSearchResult) => void;
  showMap?: boolean;
  className?: string;
}

type ViewMode = "list" | "map" | "split";
type SortOption = "distance" | "rating" | "name";

export function LocationAwareBusinessList({
  businesses,
  searchLocation,
  searchRadius,
  isLoading = false,
  onBusinessSelect,
  showMap = true,
  className,
}: LocationAwareBusinessListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  );

  // Sort businesses based on selected criteria
  const sortedBusinesses = [...businesses].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return a.distance - b.distance;
      case "rating":
        // TODO: Implement when rating system is added
        return a.distance - b.distance;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleBusinessSelect = (business: BusinessSearchResult) => {
    setSelectedBusinessId(business.id);
    onBusinessSelect?.(business);
  };

  const handleBookNow = (businessId: string) => {
    router.push(`/book/${businessId}`);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    }
    return `${distance.toFixed(1)} mi`;
  };

  const formatTravelTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Convert businesses to map format
  const mapBusinesses = sortedBusinesses.map((business) => ({
    id: business.id,
    name: business.name,
    address: business.businessLocation.address,
    coordinates: {
      latitude: business.businessLocation.latitude,
      longitude: business.businessLocation.longitude,
    },
    rating: 4.5, // TODO: Use actual rating when available
    distance: business.distance,
    services: business.services?.map((s) => s.name) || [],
  }));

  const mapCenter =
    searchLocation ||
    (businesses.length > 0
      ? {
          lat: businesses[0]?.businessLocation.latitude || 0,
          lng: businesses[0]?.businessLocation.longitude || 0,
        }
      : { lat: 40.7128, lng: -74.006 });

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Searching for businesses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {businesses.length} businesses found
          </h2>
          {searchLocation && searchRadius && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Within {searchRadius} miles of your location
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="distance">Sort by: Distance</option>
            <option value="rating">Sort by: Rating</option>
            <option value="name">Sort by: Name</option>
          </select>

          {/* View Mode Toggle */}
          {showMap && (
            <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="rounded-none"
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "split" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("split")}
                className="rounded-none"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "map" ? (
        <div className="h-[600px] overflow-hidden rounded-lg border">
          <EnhancedBusinessMap
            businesses={mapBusinesses}
            center={mapCenter}
            zoom={searchRadius ? Math.max(8, 14 - Math.log2(searchRadius)) : 12}
            onBusinessSelect={handleBusinessSelect}
            showUserLocation={!!searchLocation}
            userLocation={searchLocation}
            selectedBusinessId={selectedBusinessId}
            className="h-full w-full"
          />
        </div>
      ) : viewMode === "split" ? (
        <div className="grid h-[600px] grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Business List */}
          <div className="overflow-y-auto">
            <BusinessGrid
              businesses={sortedBusinesses}
              onBusinessSelect={handleBusinessSelect}
              onBookNow={handleBookNow}
              selectedBusinessId={selectedBusinessId}
            />
          </div>
          {/* Map */}
          <div className="overflow-hidden rounded-lg border">
            <EnhancedBusinessMap
              businesses={mapBusinesses}
              center={mapCenter}
              zoom={
                searchRadius ? Math.max(8, 14 - Math.log2(searchRadius)) : 12
              }
              onBusinessSelect={handleBusinessSelect}
              showUserLocation={!!searchLocation}
              userLocation={searchLocation}
              selectedBusinessId={selectedBusinessId}
              className="h-full w-full"
            />
          </div>
        </div>
      ) : (
        <BusinessGrid
          businesses={sortedBusinesses}
          onBusinessSelect={handleBusinessSelect}
          onBookNow={handleBookNow}
          selectedBusinessId={selectedBusinessId}
        />
      )}
    </div>
  );
}

interface BusinessGridProps {
  businesses: BusinessSearchResult[];
  onBusinessSelect: (business: BusinessSearchResult) => void;
  onBookNow: (businessId: string) => void;
  selectedBusinessId: string | null;
}

function BusinessGrid({
  businesses,
  onBusinessSelect,
  onBookNow,
  selectedBusinessId,
}: BusinessGridProps) {
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    }
    return `${distance.toFixed(1)} mi`;
  };

  const formatTravelTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (businesses.length === 0) {
    return (
      <div className="py-12 text-center">
        <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          No businesses found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try expanding your search radius or changing your location.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {businesses.map((business) => (
        <div
          key={business.id}
          className={cn(
            "cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800",
            selectedBusinessId === business.id &&
              "ring-primary ring-2 ring-offset-2",
          )}
          onClick={() => onBusinessSelect(business)}
        >
          <div className="from-primary/20 to-accent/20 flex h-48 items-center justify-center bg-gradient-to-br">
            {/* Placeholder for business image */}
            <div className="text-6xl">🏢</div>
          </div>

          <div className="p-6">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {business.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {business.category.name}
              </Badge>
            </div>

            {/* Rating */}
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                4.5
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                (25 reviews)
              </span>
            </div>

            {/* Location and Distance */}
            <div className="mb-3 space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {business.businessLocation.city},{" "}
                  {business.businessLocation.state}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="text-primary flex items-center gap-1">
                  <Navigation className="h-4 w-4" />
                  <span className="font-medium">
                    {formatDistance(business.distance)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{formatTravelTime(business.estimatedTravelTime)}</span>
                </div>
              </div>
            </div>

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {business.services.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service.name}
                    </Badge>
                  ))}
                  {business.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{business.services.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {business.description && (
              <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {business.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {business.businessLocation.serviceRadius && (
                  <span>
                    Serves {business.businessLocation.serviceRadius} mi radius
                  </span>
                )}
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow(business.id);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
