"use client";

import { useState, useEffect } from "react";
import type { BusinessLocationModel } from "@/types/location";

interface UseBusinessLocationResult {
  location: BusinessLocationModel | null;
  isLoading: boolean;
  error: string | null;
  updateLocation: (location: BusinessLocationModel) => void;
  refetch: () => Promise<void>;
}

export function useBusinessLocation(
  businessId?: string,
): UseBusinessLocationResult {
  const [location, setLocation] = useState<BusinessLocationModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    if (!businessId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/businesses/${businessId}/location`);
      const data = await response.json();

      if (data.success) {
        setLocation(data.data);
      } else {
        setError(data.error || "Failed to fetch location");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch location");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [businessId]);

  const updateLocation = (newLocation: BusinessLocationModel) => {
    setLocation(newLocation);
  };

  const refetch = async () => {
    await fetchLocation();
  };

  return {
    location,
    isLoading,
    error,
    updateLocation,
    refetch,
  };
}
