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
  error: string | null;
  selectLocation: (location: LocationCoordinates) => void;
  searchByAddress: (address: string) => Promise<void>;
  clearSelection: () => void;
  clearError: () => void;
}

export function useLocationSelection(): UseLocationSelectionResult {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationCoordinates | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectLocation = useCallback((location: LocationCoordinates) => {
    setSelectedLocation(location);
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Mock geocoding service - in a real implementation, this would use a service like Google Maps Geocoding API
  const searchByAddress = useCallback(
    async (address: string): Promise<void> => {
      if (!address.trim()) {
        setError("Please enter an address");
        return;
      }

      setIsSearching(true);
      setError(null);
      setSearchQuery(address);

      try {
        // Mock implementation - in reality, you'd call a geocoding service
        // For now, we'll simulate some common locations or zip codes
        const mockResults = await mockGeocodeAddress(address);

        if (mockResults.length === 0) {
          setError("No locations found for the provided address");
          setSearchResults([]);
          return;
        }

        setSearchResults(mockResults);

        // Auto-select the first result if there's only one
        if (mockResults.length === 1 && mockResults[0]) {
          setSelectedLocation(mockResults[0].coordinates);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search for address";
        setError(errorMessage);
        setSearchResults([]);
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
    error,
    selectLocation,
    searchByAddress,
    clearSelection,
    clearError,
  };
}

// Mock geocoding function - replace with real geocoding service
async function mockGeocodeAddress(
  address: string,
): Promise<LocationSearchResult[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const query = address.toLowerCase().trim();

  // Mock some common zip codes and addresses for testing
  const mockLocations: Record<string, LocationSearchResult> = {
    "10001": {
      id: "nyc-10001",
      address: "New York",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      coordinates: { latitude: 40.7505, longitude: -73.9934 },
      displayName: "New York, NY 10001",
    },
    "90210": {
      id: "bh-90210",
      address: "Beverly Hills",
      city: "Beverly Hills",
      state: "CA",
      zipCode: "90210",
      coordinates: { latitude: 34.0901, longitude: -118.4065 },
      displayName: "Beverly Hills, CA 90210",
    },
    "60601": {
      id: "chi-60601",
      address: "Chicago",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      coordinates: { latitude: 41.8781, longitude: -87.6298 },
      displayName: "Chicago, IL 60601",
    },
    "33101": {
      id: "mia-33101",
      address: "Miami",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      coordinates: { latitude: 25.7617, longitude: -80.1918 },
      displayName: "Miami, FL 33101",
    },
    "78701": {
      id: "aus-78701",
      address: "Austin",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      coordinates: { latitude: 30.2672, longitude: -97.7431 },
      displayName: "Austin, TX 78701",
    },
  };

  const results: LocationSearchResult[] = [];

  // Check for exact zip code match
  if (mockLocations[query]) {
    results.push(mockLocations[query]!);
  }

  // Check for partial matches in city names
  Object.values(mockLocations).forEach((location) => {
    if (
      location.city.toLowerCase().includes(query) ||
      location.state.toLowerCase().includes(query) ||
      location.displayName.toLowerCase().includes(query)
    ) {
      if (!results.find((r) => r.id === location.id)) {
        results.push(location);
      }
    }
  });

  // If no matches found, create a mock result based on the query
  if (results.length === 0 && query.length > 2) {
    // Generate a mock coordinate based on the query (for demo purposes)
    const mockLat = 40.7128 + (Math.random() - 0.5) * 10; // Around NYC area
    const mockLng = -74.006 + (Math.random() - 0.5) * 10;

    results.push({
      id: `mock-${Date.now()}`,
      address: query,
      city: "Unknown",
      state: "Unknown",
      zipCode: "00000",
      coordinates: { latitude: mockLat, longitude: mockLng },
      displayName: `${query} (approximate location)`,
    });
  }

  return results;
}
