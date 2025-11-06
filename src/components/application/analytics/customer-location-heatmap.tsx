"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, RefreshCw, Eye, EyeOff } from "lucide-react";

interface HeatMapPoint {
  latitude: number;
  longitude: number;
}

interface HeatMapData {
  points: HeatMapPoint[];
  totalPoints: number;
}

interface CustomerLocationHeatMapProps {
  businessId: string;
  businessLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export function CustomerLocationHeatMap({
  businessId,
  businessLocation,
}: CustomerLocationHeatMapProps) {
  const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    async function fetchHeatMapData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/analytics/location/heatmap?businessId=${businessId}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch heat map data");
        }

        const data = await response.json();
        setHeatMapData(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load heat map data",
        );
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      fetchHeatMapData();
    }
  }, [businessId]);

  const handleRefresh = () => {
    setHeatMapData(null);
    setLoading(true);
    // Re-trigger the useEffect
    const event = new CustomEvent("refresh-heatmap");
    window.dispatchEvent(event);
  };

  if (loading) {
    return <HeatMapLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Location Heat Map</CardTitle>
          <CardDescription>
            Visual representation of where your customers are located
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!heatMapData || heatMapData.totalPoints === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Location Heat Map</CardTitle>
          <CardDescription>
            Visual representation of where your customers are located
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <MapPin className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">No Location Data Yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Customer locations will appear here as they book appointments and
              share their location.
            </p>
            <p className="text-muted-foreground text-xs">
              Encourage customers to allow location access during booking for
              better insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Customer Location Heat Map
            </CardTitle>
            <CardDescription>
              {heatMapData.totalPoints} customer location
              {heatMapData.totalPoints !== 1 ? "s" : ""} visualized
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showMap ? "Hide" : "Show"} Map
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showMap ? (
          <HeatMapVisualization
            points={heatMapData.points}
            businessLocation={businessLocation}
          />
        ) : (
          <HeatMapSummary
            points={heatMapData.points}
            businessLocation={businessLocation}
          />
        )}
      </CardContent>
    </Card>
  );
}

function HeatMapVisualization({
  points,
  businessLocation,
}: {
  points: HeatMapPoint[];
  businessLocation?: { latitude: number; longitude: number; address: string };
}) {
  // Calculate bounds for the map
  const bounds = calculateBounds(points, businessLocation);

  return (
    <div className="space-y-4">
      <div className="bg-muted flex min-h-[300px] items-center justify-center rounded-lg p-4">
        <div className="text-center">
          <MapPin className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            Interactive map visualization would be displayed here
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Showing {points.length} customer locations
            {businessLocation && " relative to your business"}
          </p>
        </div>
      </div>

      <HeatMapStats points={points} businessLocation={businessLocation} />
    </div>
  );
}

function HeatMapSummary({
  points,
  businessLocation,
}: {
  points: HeatMapPoint[];
  businessLocation?: { latitude: number; longitude: number; address: string };
}) {
  const stats = calculateLocationStats(points, businessLocation);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h4 className="font-medium">Location Distribution</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total locations:</span>
              <span className="font-medium">{points.length}</span>
            </div>
            {stats.coverage && (
              <>
                <div className="flex justify-between">
                  <span>Coverage area:</span>
                  <span className="font-medium">
                    {stats.coverage.toFixed(1)} sq mi
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Spread radius:</span>
                  <span className="font-medium">
                    {stats.maxDistance.toFixed(1)} mi
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Geographic Center</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Latitude:</span>
              <span className="font-mono text-xs">
                {stats.center.latitude.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Longitude:</span>
              <span className="font-mono text-xs">
                {stats.center.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // This would open the full map view
            console.log("Open full map view");
          }}
        >
          <MapPin className="mr-2 h-4 w-4" />
          View Full Map
        </Button>
      </div>
    </div>
  );
}

function HeatMapStats({
  points,
  businessLocation,
}: {
  points: HeatMapPoint[];
  businessLocation?: { latitude: number; longitude: number; address: string };
}) {
  const stats = calculateLocationStats(points, businessLocation);

  return (
    <div className="grid gap-4 text-sm md:grid-cols-3">
      <div className="bg-muted rounded-lg p-3 text-center">
        <div className="text-lg font-medium">{points.length}</div>
        <div className="text-muted-foreground">Locations</div>
      </div>

      {stats.coverage && (
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-lg font-medium">{stats.coverage.toFixed(1)}</div>
          <div className="text-muted-foreground">Sq Miles</div>
        </div>
      )}

      <div className="bg-muted rounded-lg p-3 text-center">
        <div className="text-lg font-medium">
          {stats.maxDistance.toFixed(1)}
        </div>
        <div className="text-muted-foreground">Max Distance</div>
      </div>
    </div>
  );
}

function HeatMapLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

// Utility functions
function calculateBounds(
  points: HeatMapPoint[],
  businessLocation?: { latitude: number; longitude: number },
) {
  const allPoints = businessLocation ? [...points, businessLocation] : points;

  if (allPoints.length === 0) {
    return null;
  }

  const lats = allPoints.map((p) => p.latitude);
  const lngs = allPoints.map((p) => p.longitude);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

function calculateLocationStats(
  points: HeatMapPoint[],
  businessLocation?: { latitude: number; longitude: number },
) {
  if (points.length === 0) {
    return {
      center: { latitude: 0, longitude: 0 },
      coverage: 0,
      maxDistance: 0,
    };
  }

  // Calculate geographic center
  const center = {
    latitude: points.reduce((sum, p) => sum + p.latitude, 0) / points.length,
    longitude: points.reduce((sum, p) => sum + p.longitude, 0) / points.length,
  };

  // Calculate maximum distance from center
  const distances = points.map((point) => {
    const latDiff = point.latitude - center.latitude;
    const lngDiff = point.longitude - center.longitude;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough miles conversion
  });

  const maxDistance = Math.max(...distances);

  // Rough coverage area calculation (circle area)
  const coverage = Math.PI * maxDistance * maxDistance;

  return {
    center,
    coverage,
    maxDistance,
  };
}
