"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function TimeSlotGrid({
  selectedDate,
  selectedTime,
  timeSlots,
  onTimeSelect,
  loading = false,
}: TimeSlotGridProps) {
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours || "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes || "00"} ${ampm}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
            <Calendar className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center">Please select a date to see available times</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.available);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Available Times</span>
        </CardTitle>
        {selectedDate && (
          <p className="text-sm text-gray-600">
            {formatDate(selectedDate)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {availableSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-center font-medium">No available times</p>
            <p className="text-center text-sm">
              Please select a different date or check back later
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSlots.map((slot, index) => {
                const isSelected = selectedTime === slot.startTime;
                const timeKey = `${selectedDate || slot.date}-${slot.startTime}`;

                return (
                  <Button
                    key={timeKey}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTimeSelect(slot.startTime, slot.endTime)}
                    className={cn(
                      "justify-center text-sm font-medium transition-all",
                      {
                        "bg-purple-600 hover:bg-purple-700 text-white": isSelected,
                        "hover:bg-purple-50 hover:border-purple-300": !isSelected,
                      }
                    )}
                  >
                    {formatTime(slot.startTime)}
                  </Button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Booking Information</p>
                  <p className="text-blue-600">
                    {availableSlots.length} time slot{availableSlots.length !== 1 ? 's' : ''} available
                  </p>
                  {selectedTime && (
                    <p className="text-blue-600 mt-1">
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