"use client";

import { useState, useEffect, useCallback } from "react";

export interface TimeSlot {
    date: string;
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface AvailabilitySlot {
    date: string;
    dayOfWeek: number;
    slots: TimeSlot[];
}

interface UseAvailabilityOptions {
    businessId: string;
    serviceId?: string;
    startDate?: string;
    days?: number;
    refreshInterval?: number; // in milliseconds
}

interface UseAvailabilityReturn {
    availability: AvailabilitySlot[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    getAvailableDates: () => string[];
    getTimeSlotsForDate: (date: string) => TimeSlot[];
}

export function useAvailability({
    businessId,
    serviceId,
    startDate,
    days = 30,
    refreshInterval = 30000, // 30 seconds
}: UseAvailabilityOptions): UseAvailabilityReturn {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAvailability = useCallback(async () => {
        if (!businessId) {
            setError("Business ID is required");
            setLoading(false);
            return;
        }

        try {
            setError(null);

            const params = new URLSearchParams();
            if (serviceId) params.append("serviceId", serviceId);
            if (startDate) params.append("startDate", startDate);
            if (days) params.append("days", days.toString());

            const response = await fetch(
                `/api/businesses/${businessId}/availability?${params.toString()}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch availability");
            }

            const data = await response.json();
            setAvailability(data.availability || []);
        } catch (err) {
            console.error("Error fetching availability:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch availability");
        } finally {
            setLoading(false);
        }
    }, [businessId, serviceId, startDate, days]);

    // Initial fetch
    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Set up periodic refresh for real-time updates
    useEffect(() => {
        if (!refreshInterval || refreshInterval <= 0) return;

        const interval = setInterval(() => {
            // Only refresh if not currently loading
            if (!loading) {
                fetchAvailability();
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [fetchAvailability, loading, refreshInterval]);

    const getAvailableDates = useCallback((): string[] => {
        return availability
            .filter(slot => slot.slots.some(timeSlot => timeSlot.available))
            .map(slot => slot.date);
    }, [availability]);

    const getTimeSlotsForDate = useCallback((date: string): TimeSlot[] => {
        const dayAvailability = availability.find(slot => slot.date === date);
        return dayAvailability?.slots || [];
    }, [availability]);

    return {
        availability,
        loading,
        error,
        refetch: fetchAvailability,
        getAvailableDates,
        getTimeSlotsForDate,
    };
}