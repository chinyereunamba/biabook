"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  availableDates?: string[];
  minDate?: string;
  maxDate?: string;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const { monthName, year, daysInMonth, firstDayOfMonth, today } =
    useMemo(() => {
      const monthName = currentMonth.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = currentMonth.getFullYear();
      const daysInMonth = new Date(
        year,
        currentMonth.getMonth() + 1,
        0,
      ).getDate();
      const firstDayOfMonth = new Date(
        year,
        currentMonth.getMonth(),
        1,
      ).getDay();
      const today = new Date().toISOString().split("T")[0];

      return { monthName, year, daysInMonth, firstDayOfMonth, today };
    }, [currentMonth]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatDateString = (day: number): string => {
    const date = new Date(year, currentMonth.getMonth(), day);
    return date.toISOString().split("T")[0] || "";
  };

  const isDateAvailable = (dateStr: string): boolean => {
    return availableDates.includes(dateStr);
  };

  const isDateDisabled = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < today) return true;

    // Check min/max date constraints
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;

    return false;
  };

  const renderCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(day);
      const isSelected = selectedDate === dateStr;
      const isAvailable = isDateAvailable(dateStr);
      const isDisabled = isDateDisabled(dateStr);
      const isToday = dateStr === today;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && onDateSelect(dateStr)}
          disabled={isDisabled}
          aria-label={`Select ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          aria-pressed={isSelected}
          className={cn(
            "relative min-h-[44px] min-w-[44px] touch-manipulation rounded-md p-2 text-sm transition-colors",
            "hover:bg-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none",
            {
              "bg-purple-600 text-white hover:bg-purple-700": isSelected,
              "cursor-not-allowed text-gray-400": isDisabled,
              "font-semibold ring-2 ring-purple-200": isToday && !isSelected,
              "font-medium text-green-600":
                isAvailable && !isSelected && !isDisabled,
              "text-gray-500": !isAvailable && !isSelected && !isDisabled,
            },
          )}
        >
          {day}
          {isAvailable && !isSelected && (
            <div className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full bg-green-500" />
          )}
        </button>,
      );
    }

    return days;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {monthName} {year}
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-10 w-10 touch-manipulation p-0" // Increased touch target
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-10 w-10 touch-manipulation p-0" // Increased touch target
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {day.substring(0, 1)}
              <span className="hidden sm:inline">{day.substring(1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <span>Unavailable</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
