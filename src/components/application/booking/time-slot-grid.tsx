"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/hooks/use-accessibility";
import { KEYBOARD_KEYS } from "@/lib/accessibility";

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface TimeSlotGridProps {
  selectedDate?: string;
  selectedTime?: string;
  timeSlots: TimeSlot[];
  onTimeSelect: (startTime: string, endTime: string) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function TimeSlotGrid({
  selectedDate,
  selectedTime,
  timeSlots,
  onTimeSelect,
  loading = false,
  error = null,
  onRefresh,
}: TimeSlotGridProps) {
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours ?? "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes ?? "00"} ${ampm}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Enhanced accessibility for time slot selection
  const { containerRef, announceToScreenReader } =
    useAccessibility<HTMLDivElement>({
      label: "Available time slots",
      enableKeyboardNavigation: true,
      onArrowKeys: (key) => {
        // Handle arrow key navigation between time slots
        const buttons = containerRef.current?.querySelectorAll(
          "button:not([disabled])",
        );
        if (!buttons) return;

        const currentIndex = Array.from(buttons).findIndex(
          (btn) => btn === document.activeElement,
        );
        let nextIndex = currentIndex;

        if (
          key === KEYBOARD_KEYS.ARROW_RIGHT ||
          key === KEYBOARD_KEYS.ARROW_DOWN
        ) {
          nextIndex = (currentIndex + 1) % buttons.length;
        } else if (
          key === KEYBOARD_KEYS.ARROW_LEFT ||
          key === KEYBOARD_KEYS.ARROW_UP
        ) {
          nextIndex =
            currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
        }

        (buttons[nextIndex] as HTMLElement)?.focus();
      },
    });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Available Times</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Available Times</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Calendar className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-center">
              Please select a date to see available times
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = timeSlots.filter((slot) => slot.available);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Available Times</span>
            </CardTitle>
            {selectedDate && (
              <p className="text-sm text-gray-600">
                {formatDate(selectedDate)}
              </p>
            )}
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              <span className="sr-only">Refresh availability</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Availability Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {availableSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Clock className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-center font-medium">No available times</p>
            <p className="text-center text-sm">
              Please select a different date or check back later
            </p>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="mt-3"
              >
                <RefreshCw
                  className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                />
                Refresh Availability
              </Button>
            )}
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              role="group"
              aria-label="Available time slots"
            >
              {availableSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.startTime;
                const timeKey = `${selectedDate ?? slot.date}-${slot.startTime}`;

                return (
                  <Button
                    key={timeKey}
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      onTimeSelect(slot.startTime, slot.endTime);
                      announceToScreenReader(
                        `Selected time ${formatTime(slot.startTime)}`,
                      );
                    }}
                    className={cn(
                      "min-h-[44px] touch-manipulation justify-center text-sm font-medium transition-all",
                      {
                        "bg-purple-600 text-white hover:bg-purple-700":
                          isSelected,
                        "hover:border-purple-300 hover:bg-purple-50":
                          !isSelected,
                      },
                    )}
                    aria-label={`Select time ${formatTime(slot.startTime)}${isSelected ? ", currently selected" : ""}`}
                    aria-pressed={isSelected}
                    tabIndex={index === 0 ? 0 : -1}
                  >
                    {formatTime(slot.startTime)}
                  </Button>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <div className="flex items-start space-x-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Booking Information</p>
                  <p className="text-blue-600">
                    {availableSlots.length} time slot
                    {availableSlots.length !== 1 ? "s" : ""} available
                  </p>
                  {selectedTime && (
                    <p className="mt-1 text-blue-600">
                      Selected: {formatTime(selectedTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
