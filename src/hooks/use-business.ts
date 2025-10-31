"use client";

import { useState, useEffect } from "react";

export interface BusinessService {
  id: string;
  name: string;
  description?: string | null;
  duration: number; // minutes
  price: number; // cents
  category?: string | null;
  bufferTime?: number | null;
  isActive?: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  rating?: string;
  reviews?: number;
  category: {
    id: string;
    name: string;
  };
  services: BusinessService[];
}

interface UseBusinessResult {
  business: BusinessProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBusiness(businessId: string): UseBusinessResult {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = async () => {
    if (!businessId) {
      setError("Business ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/businesses/${businessId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Business not found");
        }
        throw new Error("Failed to fetch business data");
      }

      const businessData: BusinessProfile = await response.json();
      setBusiness(businessData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business");
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBusiness();
  }, [businessId]);

  return {
    business,
    loading,
    error,
    refetch: fetchBusiness,
  };
}
