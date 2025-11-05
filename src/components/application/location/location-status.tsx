"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Navigation, Globe, Clock } from "lucide-react";
import type { BusinessLocationModel } from "@/types/location";

interface LocationStatusProps {
  location: BusinessLocationModel | null;
  isLoading?: boolean;
}

export function LocationStatus({ location, isLoading }: LocationStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Status
          </CardTitle>
          <CardDescription>
            Set up your business location to enable location-based features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Not Set</Badge>
            <span className="text-sm text-gray-600">
              Location not configured
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Status
        </CardTitle>
        <CardDescription>
          Your business location and service area settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800">
            Configured
          </Badge>
          <span className="text-sm text-gray-600">
            Location-based features enabled
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Address</div>
              <div className="text-sm text-gray-600">
                {location.address}
                <br />
                {location.city}, {location.state} {location.zipCode}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Navigation className="mt-0.5 h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Coordinates</div>
              <div className="font-mono text-sm text-gray-600">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Timezone</div>
              <div className="text-sm text-gray-600">{location.timezone}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Service Area</div>
              <div className="text-sm text-gray-600">
                {location.serviceRadius
                  ? `${location.serviceRadius} miles radius`
                  : "Unlimited service area"}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="text-xs text-gray-500">
            Last updated: {new Date(location.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
