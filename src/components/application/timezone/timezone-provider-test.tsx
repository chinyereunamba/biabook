"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TimezoneProvider {
  name: string;
  available: boolean;
}

interface TimezoneResult {
  timezone: string;
  provider: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export function TimezoneProviderTest() {
  const [providers, setProviders] = useState<TimezoneProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("auto");
  const [latitude, setLatitude] = useState<string>("40.7128");
  const [longitude, setLongitude] = useState<string>("-74.0060");
  const [result, setResult] = useState<TimezoneResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  const loadProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const response = await fetch("/api/timezone/providers");
      const data = await response.json();

      if (data.success) {
        setProviders(data.providers);
      } else {
        setError("Failed to load providers");
      }
    } catch (err) {
      setError("Failed to load providers");
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const testTimezone = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates");
      }

      const requestBody = {
        coordinates: { latitude: lat, longitude: lng },
        ...(selectedProvider !== "auto" && { provider: selectedProvider }),
      };

      const response = await fetch("/api/timezone/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Timezone detection failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const presetLocations = [
    { name: "New York", lat: 40.7128, lng: -74.006 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
    { name: "Sydney", lat: -33.8688, lng: 151.2093 },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  ];

  const setPresetLocation = (location: { lat: number; lng: number }) => {
    setLatitude(location.lat.toString());
    setLongitude(location.lng.toString());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timezone Provider Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load Providers */}
          <div>
            <Button
              onClick={loadProviders}
              disabled={isLoadingProviders}
              variant="outline"
              className="w-full"
            >
              {isLoadingProviders ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Load Available Providers
            </Button>
          </div>

          {/* Provider Status */}
          {providers.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Available Providers</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {providers.map((provider) => (
                  <Badge
                    key={provider.name}
                    variant={provider.available ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {provider.available ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {provider.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preset Locations */}
          <div>
            <Label className="text-sm font-medium">Preset Locations</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {presetLocations.map((location) => (
                <Button
                  key={location.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetLocation(location)}
                >
                  <MapPin className="mr-1 h-3 w-3" />
                  {location.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Coordinates Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="40.7128"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-74.0060"
              />
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (with fallback)</SelectItem>
                <SelectItem value="google">Google Timezone API</SelectItem>
                <SelectItem value="timezonedb">TimeZoneDB</SelectItem>
                <SelectItem value="worldtime">WorldTimeAPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Button */}
          <Button
            onClick={testTimezone}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Clock className="mr-2 h-4 w-4" />
            )}
            Detect Timezone
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Result Display */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detection Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Timezone:</span>
                  <Badge variant="default">{result.timezone}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Provider:</span>
                  <Badge variant="secondary">{result.provider}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Coordinates:</span>
                  <span className="text-sm text-gray-600">
                    {result.coordinates.latitude},{" "}
                    {result.coordinates.longitude}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Time:</span>
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleString("en-US", {
                      timeZone: result.timezone,
                      timeZoneName: "short",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
