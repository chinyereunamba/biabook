/**
 * Component to display geocoding provider status in admin dashboard
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ProviderInfo {
  primary: string | null;
  fallback: string | null;
  available: string[];
  hasConfigured: boolean;
}

export function GeocodingProviderStatus() {
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProviderInfo() {
      try {
        const response = await fetch("/api/location/providers");
        const data = await response.json();

        if (data.success) {
          setProviderInfo(data.data);
        } else {
          setError(data.error || "Failed to fetch provider info");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchProviderInfo();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geocoding Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading provider status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geocoding Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!providerInfo) {
    return null;
  }

  const getStatusIcon = (hasProvider: boolean) => {
    return hasProvider ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (provider: string | null) => {
    if (!provider) {
      return <Badge variant="secondary">Not configured</Badge>;
    }

    return <Badge variant="default">{provider}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Geocoding Providers
          {providerInfo.hasConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Primary Provider:</span>
              {getStatusBadge(providerInfo.primary)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fallback Provider:</span>
              {getStatusBadge(providerInfo.fallback)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Available Providers:</div>
            <div className="flex flex-wrap gap-1">
              {providerInfo.available.length > 0 ? (
                providerInfo.available.map((provider) => (
                  <Badge key={provider} variant="outline">
                    {provider}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">
                  None configured
                </span>
              )}
            </div>
          </div>
        </div>

        {!providerInfo.hasConfigured && (
          <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                No geocoding providers configured
              </span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              Configure GOOGLE_MAPS_API_KEY or LOCATIONIQ_API_KEY to enable
              location features.
            </p>
          </div>
        )}

        {providerInfo.hasConfigured && !providerInfo.fallback && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Consider adding a fallback provider
              </span>
            </div>
            <p className="mt-1 text-sm text-blue-700">
              Configure a second provider for better reliability and automatic
              failover.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
