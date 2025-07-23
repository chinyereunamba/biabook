"use client";

import { useState, useEffect } from "react";
import {
  WeeklySchedule,
  type DaySchedule,
} from "@/components/application/availability/weekly-schedule";
import {
  ExceptionDates,
  type ExceptionDate,
} from "@/components/application/availability/exception-dates";
import { toast } from "sonner";

export default function AvailabilityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionDate[]>([]);

  // Load the current user's business
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await fetch("/api/me/business");
        if (!response.ok) {
          throw new Error("Failed to fetch business");
        }

        const data = await response.json();
        if (data.business) {
          setBusinessId(data.business.id);
        } else {
          // If no business is found, use a default one for demo purposes
          setBusinessId("business-1");
        }
      } catch (error) {
        console.error("Failed to load business:", error);
        // Use a default business ID for demo purposes
        setBusinessId("business-1");
      }
    };

    loadBusiness();
  }, []);

  // Load availability data when businessId is available
  useEffect(() => {
    if (!businessId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load weekly schedule
        const scheduleResponse = await fetch(
          `/api/businesses/${businessId}/availability/weekly`,
        );
        if (!scheduleResponse.ok) {
          throw new Error("Failed to fetch weekly schedule");
        }
        const scheduleData = await scheduleResponse.json();
        setWeeklySchedule(scheduleData.weeklySchedule ?? []);

        // Load exceptions
        const exceptionsResponse = await fetch(
          `/api/businesses/${businessId}/availability/exceptions`,
        );
        if (!exceptionsResponse.ok) {
          throw new Error("Failed to fetch exceptions");
        }
        const exceptionsData = await exceptionsResponse.json();
        setExceptions(exceptionsData.exceptions ?? []);
      } catch (error) {
        console.error("Failed to load availability data:", error);
        toast.error("Failed to load availability data");

        // Set default data for demo purposes if API fails
        setWeeklySchedule([
          {
            dayOfWeek: 1,
            isAvailable: true,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            dayOfWeek: 2,
            isAvailable: true,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            dayOfWeek: 3,
            isAvailable: true,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            dayOfWeek: 4,
            isAvailable: true,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            dayOfWeek: 5,
            isAvailable: true,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            dayOfWeek: 6,
            isAvailable: false,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            dayOfWeek: 0,
            isAvailable: false,
            startTime: "09:00",
            endTime: "17:00",
          },
        ]);

        setExceptions([
          {
            id: "exception-1",
            date: "2025-12-25",
            isAvailable: false,
            reason: "Christmas Day",
          },
          {
            id: "exception-2",
            date: "2025-12-31",
            isAvailable: true,
            startTime: "09:00",
            endTime: "15:00",
            reason: "New Year's Eve - Early Closing",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [businessId]);

  const handleSaveWeeklySchedule = async (schedule: DaySchedule[]) => {
    if (!businessId) {
      toast.error("No business selected");
      return Promise.reject(new Error("No business selected"));
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/availability/weekly`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ schedule }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to save weekly schedule");
      }

      const data = await response.json();
      setWeeklySchedule(data.weeklySchedule ?? schedule);
      toast.success("Weekly schedule saved successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to save weekly schedule:", error);
      toast.error("Failed to save weekly schedule");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddException = async (exception: Omit<ExceptionDate, "id">) => {
    if (!businessId) {
      toast.error("No business selected");
      return Promise.reject(new Error("No business selected"));
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/availability/exceptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(exception),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to add exception");
      }

      const data = await response.json();
      setExceptions((prev) => [...prev, data.exception]);
      toast.success("Exception added successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to add exception:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add exception",
      );
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteException = async (id: string) => {
    if (!businessId) {
      toast.error("No business selected");
      return Promise.reject(new Error("No business selected"));
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/availability/exceptions/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to delete exception");
      }

      setExceptions((prev) => prev.filter((e) => e.id !== id));
      toast.success("Exception deleted successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to delete exception:", error);
      toast.error("Failed to delete exception");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <WeeklySchedule
        initialSchedule={weeklySchedule}
        onSave={handleSaveWeeklySchedule}
        isLoading={isLoading}
      />

      <ExceptionDates
        exceptions={exceptions}
        onAddException={handleAddException}
        onDeleteException={handleDeleteException}
        isLoading={isLoading}
      />
    </div>
  );
}
