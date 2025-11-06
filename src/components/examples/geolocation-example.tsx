"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LocationSelector,
  LocationDisplay,
} from "@/components/application/location-selector";
import {
  useLocationSelection,
  type LocationCoordinates,
} from "@/hooks/use-location-selection";

export function GeolocationExample() {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationCoordinates | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const handleLocationSelected = (location: LocationSelection) => {
    setSelectedLocation(location);
    setShowSelector(false);
  };

  const handleLocationCleared = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Geolocation Service Example</CardTitle>
          <CardDescription>
            Demonstrates the geolocation service with browser location detection
            and manual entry fallbacks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedLocation && !showSelector && (
            <Button onClick={() => setShowSelector(true)}>
              Select Location
            </Button>
          )}

          {showSelector && (
            <LocationSelector
              onLocationSelected={handleLocationSelected}
              onLocationCleared={handleLocationCleared}
              title="Choose Your Location"
              description="We'll use this to find nearby businesses and services."
            />
          )}

          {selectedLocation && !showSelector && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                  Selected Location:
                </h3>
                <LocationDisplay
                  location={selectedLocation}
                  showBadge={true}
                  showCoordinates={true}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowSelector(true)}>
                  Change Location
                </Button>
                <Button variant="ghost" onClick={handleLocationCleared}>
                  Clear Location
                </Button>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                  Location Details:
                </h4>
                <pre className="text-sm text-gray-600 dark:text-gray-400">
                  {JSON.stringify(selectedLocation, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook usage example
export function GeolocationHookExample() {
  const {
    selectedLocation,
    isSearching,
    error,
    selectLocation,
    clearSelection,
    searchByAddress,
  } = useLocationSelection();

  return (
    <Card>
      <CardHeader>
        <CardTitle>useLocationSelection Hook Example</CardTitle>
        <CardDescription>
          Shows how to use the useLocationSelection hook directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Can use geolocation:</strong>{" "}
            {canUseGeolocation ? "Yes" : "No"}
          </div>
          <div>
            <strong>Is loading:</strong> {isLoading ? "Yes" : "No"}
          </div>
          <div>
            <strong>Show manual entry:</strong> {showManualEntry ? "Yes" : "No"}
          </div>
          <div>
            <strong>Has location:</strong> {location ? "Yes" : "No"}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <strong>Error:</strong> {error}
          </div>
        )}

        {selectedLocation && (
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <LocationDisplay location={selectedLocation} showBadge={true} />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={getCurrentLocation}
            disabled={isLoading || !canUseGeolocation}
          >
            Get Current Location
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              selectLocation({ latitude: 40.7128, longitude: -74.006 })
            }
          >
            Set Example Location
          </Button>
          <Button
            variant="ghost"
            onClick={clearSelection}
            disabled={!selectedLocation}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
