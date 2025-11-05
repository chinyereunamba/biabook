"use client";

import { useState, useCallback } from "react";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: LocationCoordinates;
  displayName: string;
}

interface UseLocationSelectionResult {
  selectedLocation: LocationCoordinates | null;
  searchQuery: string;
  searchResults: LocationSearchResult[];
  isSearching: boolean;
  selectLocation: (location: LocationCoordinates) => void;
  searchByAddress: (address: string) => Promise<void>;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
}

export function useLocationSelection(): UseLocationSelectionResult {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationCoordinates | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);

  const selectLocation = useCallback((location: LocationCoordinates) => {
    setSelectedLocation(location);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  // Mock geocoding function - in a real implementation, this would use a geocoding service
  const searchByAddress = useCallback(
    async (address: string): Promise<void> => {
      setIsSearching(true);
      setSearchQuery(address);

      try {
        // Mock implementation - in reality, you'd use Google Maps Geocoding API,
        // Mapbox Geocoding API, or similar service

        // For demonstration, we'll create mock results based on common patterns
        const mockResults: LocationSearchResult[] = [];

        // Check if it looks like a zip code
        const zipMatch = address.match(/\b(\d{5}(-\d{4})?)\b/);
        if (zipMatch) {
          const zipCode = zipMatch[1];
          // Mock coordinates for common zip codes (in real implementation, use geocoding service)
          const mockZipCoordinates = getMockCoordinatesForZip(zipCode);
          if (mockZipCoordinates) {
            mockResults.push({
              id: `zip-${zipCode}`,
              address: "",
              city: "Unknown City",
              state: "Unknown State",
              zipCode: zipCode,
              coordinates: mockZipCoordinates,
              displayName: `${zipCode} Area`,
            });
          }
        }

        // If no specific results, create a generic result
        if (mockResults.length === 0) {
          // In a real implementation, this would call a geocoding API
          // For now, we'll throw an error to indicate geocoding is not implemented
          throw new Error(
            "Address geocoding not implemented. Please use your current location or provide coordinates directly.",
          );
        }

        setSearchResults(mockResults);

        // Auto-select the first result if there's only one
        if (mockResults.length === 1 && mockResults[0]) {
          setSelectedLocation(mockResults[0].coordinates);
        }
      } catch (error) {
        console.error("Address search failed:", error);
        setSearchResults([]);
        throw error;
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  return {
    selectedLocation,
    searchQuery,
    searchResults,
    isSearching,
    selectLocation,
    searchByAddress,
    clearSelection,
    setSearchQuery,
  };
}

// Mock function to get coordinates for common zip codes
// In a real implementation, this would be replaced with a proper geocoding service
function getMockCoordinatesForZip(zipCode: string): LocationCoordinates | null {
  const mockZipCodes: Record<string, LocationCoordinates> = {
    // Major US cities for testing
    "10001": { latitude: 40.7505, longitude: -73.9934 }, // NYC
    "90210": { latitude: 34.0901, longitude: -118.4065 }, // Beverly Hills
    "60601": { latitude: 41.8781, longitude: -87.6298 }, // Chicago
    "94102": { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
    "33101": { latitude: 25.7617, longitude: -80.1918 }, // Miami
    "75201": { latitude: 32.7767, longitude: -96.797 }, // Dallas
    "98101": { latitude: 47.6062, longitude: -122.3321 }, // Seattle
    "30301": { latitude: 33.749, longitude: -84.388 }, // Atlanta
    "02101": { latitude: 42.3601, longitude: -71.0589 }, // Boston
    "20001": { latitude: 38.9072, longitude: -77.0369 }, // Washington DC
  };

  return mockZipCodes[zipCode] || null;
}
