"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Users, Navigation, BarChart3 } from "lucide-react";

interface LocationAnalytics {
  totalCustomers: number;
  averageDistance: number;
  commonZipCodes: Array<{ zipCode: string; count: number }>;
  locationData: Array<{
    latitude?: number;
    longitude?: number;
    zipCode?: string;
    distanceToBusiness?: number;
  }>;
}

interface LocationAnalyticsDashboardProps {
  businessId: string;
}

export function LocationAnalyticsDashboard({
  businessId,
}: LocationAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/analytics/location?businessId=${businessId}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch analytics");
        }

        const data = await response.json();
        setAnalytics(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      fetchAnalytics();
    }
  }, [businessId]);

  if (loading) {
    return <LocationAnalyticsLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <AlertDescription>
          No location analytics data available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CustomerMetricsCard analytics={analytics} />
        <AverageDistanceCard analytics={analytics} />
        <ServiceCoverageCard analytics={analytics} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CommonZipCodesCard analytics={analytics} />
        <LocationInsightsCard analytics={analytics} />
      </div>
    </div>
  );
}

function CustomerMetricsCard({ analytics }: { analytics: LocationAnalytics }) {
  const locationsWithCoordinates = analytics.locationData.filter(
    (location) => location.latitude && location.longitude,
  ).length;

  const locationsWithZipCode = analytics.locationData.filter(
    (location) => location.zipCode,
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Customer Locations
        </CardTitle>
        <Users className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
        <p className="text-muted-foreground text-xs">
          Total customers with location data
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span>With coordinates:</span>
            <span>{locationsWithCoordinates}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>With zip codes:</span>
            <span>{locationsWithZipCode}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AverageDistanceCard({ analytics }: { analytics: LocationAnalytics }) {
  const locationsWithDistance = analytics.locationData.filter(
    (location) =>
      location.distanceToBusiness !== null &&
      location.distanceToBusiness !== undefined,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average Distance</CardTitle>
        <Navigation className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {analytics.averageDistance > 0
            ? `${analytics.averageDistance} mi`
            : "N/A"}
        </div>
        <p className="text-muted-foreground text-xs">
          Average customer travel distance
        </p>
        {locationsWithDistance.length > 0 && (
          <div className="mt-2">
            <p className="text-muted-foreground text-xs">
              Based on {locationsWithDistance.length} customers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ServiceCoverageCard({ analytics }: { analytics: LocationAnalytics }) {
  const maxDistance = Math.max(
    ...analytics.locationData
      .filter(
        (location) =>
          location.distanceToBusiness !== null &&
          location.distanceToBusiness !== undefined,
      )
      .map((location) => location.distanceToBusiness!),
  );

  const coverageRadius = maxDistance > 0 ? maxDistance : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Service Coverage</CardTitle>
        <MapPin className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {coverageRadius > 0 ? `${Math.round(coverageRadius)} mi` : "N/A"}
        </div>
        <p className="text-muted-foreground text-xs">
          Maximum customer distance
        </p>
        {coverageRadius > 0 && (
          <div className="mt-2">
            <p className="text-muted-foreground text-xs">
              Your service area reaches customers up to{" "}
              {Math.round(coverageRadius)} miles away
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommonZipCodesCard({ analytics }: { analytics: LocationAnalytics }) {
  const topZipCodes = analytics.commonZipCodes.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Most Common Zip Codes</CardTitle>
        <CardDescription>
          Top areas where your customers are located
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topZipCodes.length > 0 ? (
          <div className="space-y-2">
            {topZipCodes.map((zipCode, index) => (
              <div
                key={zipCode.zipCode}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{zipCode.zipCode}</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  {zipCode.count} customer{zipCode.count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No zip code data available yet. Zip codes will appear as customers
            book appointments.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function LocationInsightsCard({ analytics }: { analytics: LocationAnalytics }) {
  const locationsWithDistance = analytics.locationData.filter(
    (location) =>
      location.distanceToBusiness !== null &&
      location.distanceToBusiness !== undefined,
  );

  const nearbyCustomers = locationsWithDistance.filter(
    (location) => location.distanceToBusiness! <= 10,
  ).length;

  const distantCustomers = locationsWithDistance.filter(
    (location) => location.distanceToBusiness! > 25,
  ).length;

  const dataQuality =
    analytics.locationData.filter(
      (location) => location.latitude && location.longitude,
    ).length / Math.max(analytics.totalCustomers, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Location Insights</CardTitle>
        <CardDescription>
          Analysis of your customer location patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locationsWithDistance.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm">Nearby customers (≤10 mi):</span>
                <Badge variant="secondary">{nearbyCustomers}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Distant customers (&gt;25 mi):</span>
                <Badge variant="outline">{distantCustomers}</Badge>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm">Location data quality:</span>
            <Badge
              variant={
                dataQuality > 0.7
                  ? "default"
                  : dataQuality > 0.3
                    ? "secondary"
                    : "outline"
              }
            >
              {Math.round(dataQuality * 100)}%
            </Badge>
          </div>

          {analytics.totalCustomers > 0 && (
            <div className="bg-muted mt-4 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">
                {dataQuality < 0.3 &&
                  "Consider encouraging customers to share their location for better insights."}
                {dataQuality >= 0.3 &&
                  dataQuality < 0.7 &&
                  "Good location data coverage. More data will improve insights."}
                {dataQuality >= 0.7 &&
                  "Excellent location data coverage for detailed analytics."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LocationAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
