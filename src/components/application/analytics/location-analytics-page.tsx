"use client";

import { useState, useEffect } from "react";
import { LocationAnalyticsDashboard } from "./location-analytics-dashboard";
import { CustomerLocationHeatMap } from "./customer-location-heatmap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, BarChart3, Settings, Info } from "lucide-react";

interface BusinessLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface LocationAnalyticsPageProps {
  businessId: string;
}

export function LocationAnalyticsPage({
  businessId,
}: LocationAnalyticsPageProps) {
  const [businessLocation, setBusinessLocation] =
    useState<BusinessLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusinessLocation() {
      try {
        setLoading(true);
        setError(null);

        // Fetch business location information
        const response = await fetch(`/api/businesses/${businessId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch business information");
        }

        const data = await response.json();

        // Check if business has location data
        if (data.business?.location) {
          setBusinessLocation(data.business.location);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load business information",
        );
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      fetchBusinessLocation();
    }
  }, [businessId]);

  if (loading) {
    return <LocationAnalyticsPageLoading />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <LocationAnalyticsHeader />
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LocationAnalyticsHeader businessLocation={businessLocation} />

      {!businessLocation && <LocationSetupPrompt businessId={businessId} />}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics Overview</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Location Heat Map</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <LocationAnalyticsDashboard businessId={businessId} />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <CustomerLocationHeatMap
            businessId={businessId}
            businessLocation={
              businessLocation
                ? {
                    latitude: businessLocation.latitude,
                    longitude: businessLocation.longitude,
                    address: businessLocation.address,
                  }
                : undefined
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LocationAnalyticsHeader({
  businessLocation,
}: {
  businessLocation?: BusinessLocation | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Location Analytics</h1>
          <p className="text-muted-foreground">
            Understand where your customers are coming from and optimize your
            service area
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {businessLocation ? (
            <Badge variant="default" className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Location Set</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Settings className="h-3 w-3" />
              <span>Setup Required</span>
            </Badge>
          )}
        </div>
      </div>

      {businessLocation && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="font-medium">Business Location</p>
                <p className="text-muted-foreground text-sm">
                  {businessLocation.address}, {businessLocation.city},{" "}
                  {businessLocation.state} {businessLocation.zipCode}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Coordinates: {businessLocation.latitude.toFixed(4)},{" "}
                  {businessLocation.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LocationSetupPrompt({ businessId }: { businessId: string }) {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="mb-1 font-medium">Location Setup Required</p>
          <p className="text-sm">
            Set up your business location to enable customer location analytics
            and proximity-based features.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={`/dashboard/settings/location`}>
            <Settings className="mr-2 h-4 w-4" />
            Setup Location
          </a>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function LocationAnalyticsPageLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="bg-muted h-8 w-48 animate-pulse rounded" />
            <div className="bg-muted h-4 w-96 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-6 w-24 animate-pulse rounded" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-muted h-10 w-full animate-pulse rounded" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded" />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-muted h-64 animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
