"use client";

import { useState } from "react";
import { MapPin, Search, Navigation, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddressSearch, ZipCodeSearch } from "./address-search";
import { LocationRequestButton } from "./location-permission-request";
import type { Coordinates, Address, LocationError } from "@/types/location";

export interface ManualLocationEntryProps {
  onLocationSelected: (
    coordinates: Coordinates,
    address?: Address,
    zipCode?: string,
  ) => void;
  onBack?: () => void;
  title?: string;
  description?: string;
  showGeolocationOption?: boolean;
  className?: string;
}

export function ManualLocationEntry({
  onLocationSelected,
  onBack,
  title = "Enter your location",
  description = "Search by address or ZIP code to find nearby businesses.",
  showGeolocationOption = true,
  className,
}: ManualLocationEntryProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("address");

  const handleAddressSelected = (
    coordinates: Coordinates,
    address: Address,
  ) => {
    setError(null);
    onLocationSelected(coordinates, address);
  };

  const handleZipCodeSelected = (coordinates: Coordinates, zipCode: string) => {
    setError(null);
    onLocationSelected(coordinates, undefined, zipCode);
  };

  const handleGeolocationSuccess = (coordinates: Coordinates) => {
    setError(null);
    onLocationSelected(coordinates);
  };

  const handleError = (err: Error | LocationError) => {
    setError(err.message);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-auto p-1 text-xs"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {showGeolocationOption && (
          <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Use current location
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get your exact location for the most accurate results
                </p>
              </div>
              <LocationRequestButton
                onLocationGranted={handleGeolocationSuccess}
                onError={handleError}
                variant="outline"
                size="sm"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Locate me
              </LocationRequestButton>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-950">
              Or enter manually
            </span>
          </div>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="address" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Address
            </TabsTrigger>
            <TabsTrigger value="zipcode" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ZIP Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="address" className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search by address
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Start typing your address and select from suggestions
              </p>
            </div>
            <AddressSearch
              onAddressSelected={handleAddressSelected}
              onError={handleError}
              placeholder="123 Main St, City, State"
              autoFocus={selectedTab === "address"}
            />
          </TabsContent>

          <TabsContent value="zipcode" className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search by ZIP code
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter a 5-digit ZIP code (e.g., 12345)
              </p>
            </div>
            <ZipCodeSearch
              onLocationSelected={handleZipCodeSelected}
              onError={handleError}
              placeholder="12345"
            />
          </TabsContent>
        </Tabs>

        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Why do we need your location?
              </p>
              <p className="text-blue-700 dark:text-blue-200">
                We use your location to find nearby businesses, calculate
                distances, and provide accurate directions. Your location is not
                stored or shared.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified inline version for forms
export interface LocationInputProps {
  onLocationSelected: (coordinates: Coordinates, displayText: string) => void;
  onError?: (error: Error) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function LocationInput({
  onLocationSelected,
  onError,
  placeholder = "Enter address or ZIP code",
  className,
  disabled = false,
  required = false,
}: LocationInputProps) {
  const handleAddressSelected = (
    coordinates: Coordinates,
    address: Address,
  ) => {
    const displayText = `${address.address}, ${address.city}, ${address.state} ${address.zipCode}`;
    onLocationSelected(coordinates, displayText);
  };

  const handleZipCodeSelected = (coordinates: Coordinates, zipCode: string) => {
    onLocationSelected(coordinates, zipCode);
  };

  return (
    <div className={className}>
      <AddressSearch
        onAddressSelected={handleAddressSelected}
        onError={onError}
        placeholder={placeholder}
        disabled={disabled}
      />
      {required && (
        <p className="mt-1 text-xs text-gray-500">
          You can also search by ZIP code (e.g., 12345)
        </p>
      )}
    </div>
  );
}
