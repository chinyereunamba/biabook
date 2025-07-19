"use client";

import { useState, useEffect } from "react";
import { WeeklySchedule, DaySchedule } from "@/components/application/availability/weekly-schedule";
import { ExceptionDates, ExceptionDate } from "@/components/application/availability/exception-dates";
import { toast } from "sonner";

// Mock data - in a real app, this would come from an API
const MOCK_BUSINESS_ID = "business-123";

export default function AvailabilityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionDate[]>([]);

  // Simulate loading data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock weekly schedule data
        setWeeklySchedule([
          { dayOfWeek: 1, isAvailable: true, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, isAvailable: true, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, isAvailable: true, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, isAvailable: true, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 5, isAvailable: true, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 6, isAvailable: false, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 0, isAvailable: false, startTime: "09:00", endTime: "17:00" },
        ]);
        
        // Mock exceptions data
        setExceptions([
          { 
            id: "exception-1", 
            date: "2025-12-25", 
            isAvailable: false, 
            reason: "Christmas Day" 
          },
          { 
            id: "exception-2", 
            date: "2025-12-31", 
            isAvailable: true, 
            startTime: "09:00", 
            endTime: "15:00", 
            reason: "New Year's Eve - Early Closing" 
          },
        ]);
      } catch (error) {
        console.error("Failed to load availability data:", error);
        toast.error("Failed to load availability data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSaveWeeklySchedule = async (schedule: DaySchedule[]) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeeklySchedule(schedule);
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to save weekly schedule:", error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddException = async (exception: Omit<ExceptionDate, 'id'>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newException = {
        ...exception,
        id: `exception-${Date.now()}`, // Generate a mock ID
      };
      setExceptions(prev => [...prev, newException]);
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to add exception:", error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteException = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExceptions(prev => prev.filter(e => e.id !== id));
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to delete exception:", error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <WeeklySchedule
        businessId={MOCK_BUSINESS_ID}
        initialSchedule={weeklySchedule}
        onSave={handleSaveWeeklySchedule}
        isLoading={isLoading}
      />
      
      <ExceptionDates
        businessId={MOCK_BUSINESS_ID}
        exceptions={exceptions}
        onAddException={handleAddException}
        onDeleteException={handleDeleteException}
        isLoading={isLoading}
      />
    </div>
  );
}