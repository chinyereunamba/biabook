"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Globe, Info, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getUserTimezone,
  convertAppointmentTimezones,
  getTimezoneAbbreviation,
  type TimezoneConversionResult,
} from "@/lib/timezone-utils";
import { cn } from "@/lib/utils";

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  available: boolean;
  businessTime?: string; // Formatted business time
  customerTime?: string; // Formatted customer time
  timezoneOffset?: number; // Hours difference
}

export interface TimezoneAwareTimeSlotsProps {
  selectedDate: string; // YYYY-MM-DD
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
  businessTimezone: string;
  selectedTime?: string;
  onTimeSelect: (startTime: string, endTime: string) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
  showCustomerTime?: boolean;
}

export function TimezoneAwareTimeSlots({
  selectedDate,
  timeSlots,
  businessTimezone,
  selectedTime,
  onTimeSelect,
  loading = false,
  error = null,
  onRefresh,
  className,
  showCustomerTime = true,
}: TimezoneAwareTimeSlotsProps) {
  const [customerTimezone] = useState(getUserTimezone());
  const [timezoneConversions, setTimezoneConversions] = useState<
    Map<string, TimezoneConversionResult>
  >(new Map());
  const [isConverting, setIsConverting] = useState(false);

  // Convert all time slots to customer timezone
  const convertTimeSlots = useMemo(async () => {
    if (!selectedDate || !businessTimezone || !showCustomerTime) {
      return;
    }

    setIsConverting(true);
    const conversions = new Map<string, TimezoneConversionResult>();

    try {
      for (const slot of timeSlots) {
        if (slot.available) {
          const conversion = await convertAppointmentTimezones(
            selectedDate,
            slot.startTime,
            businessTimezone,
            customerTimezone,
          );
          conversions.set(slot.startTime, conversion);
        }
      }
      setTimezoneConversions(conversions);
    } catch (err) {
      console.error("Failed to convert time slots:", err);
    } finally {
      setIsConverting(false);
    }
  }, [
    selectedDate,
    timeSlots,
    businessTimezone,
    customerTimezone,
    showCustomerTime,
  ]);

  // Run conversion when dependencies change
  useEffect(() => {
    convertTimeSlots;
  }, [convertTimeSlots]);

  // Enhanced time slots with timezone information
  const enhancedTimeSlots: TimeSlot[] = useMemo(() => {
    return timeSlots.map((slot) => {
      const conversion = timezoneConversions.get(slot.startTime);

      return {
        ...slot,
        businessTime: `${slot.startTime} ${getTimezoneAbbreviation(businessTimezone)}`,
        customerTime: conversion
          ? `${conversion.customerTime.time} ${getTimezoneAbbreviation(customerTimezone)}`
          : undefined,
        timezoneOffset: conversion?.timezoneOffset,
      };
    });
  }, [timeSlots, timezoneConversions, businessTimezone, customerTimezone]);

  // Check if there are significant timezone differences
  const hasSignificantTimeDifference = useMemo(() => {
    return Array.from(timezoneConversions.values()).some(
      (conversion) => Math.abs(conversion.timezoneOffset) >= 1,
    );
  }, [timezoneConversions]);

  // Check if any appointments cross date boundaries
  const hasCrossDayAppointments = useMemo(() => {
    return Array.from(timezoneConversions.values()).some(
      (conversion) =>
        conversion.businessTime.date !== conversion.customerTime.date,
    );
  }, [timezoneConversions]);

  if (loading || isConverting) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading available times...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = enhancedTimeSlots.filter((slot) => slot.available);

  if (availableSlots.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No times available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please select a different date or try refreshing.
            </p>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Available Times
          {hasSignificantTimeDifference && (
            <Badge variant="secondary" className="text-xs">
              <Globe className="mr-1 h-3 w-3" />
              Timezone Aware
            </Badge>
          )}
        </CardTitle>
        {hasSignificantTimeDifference && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Times shown in business timezone with your local time below
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cross-day warning */}
        {hasCrossDayAppointments && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Some appointments may be on different dates in your timezone due
              to time differences.
            </AlertDescription>
          </Alert>
        )}

        {/* Time Slots Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {availableSlots.map((slot) => {
            const isSelected = selectedTime === slot.startTime;
            const showBothTimes =
              showCustomerTime &&
              slot.customerTime &&
              hasSignificantTimeDifference;

            return (
              <Button
                key={slot.startTime}
                variant={isSelected ? "primary" : "outline"}
                onClick={() => onTimeSelect(slot.startTime, slot.endTime)}
                className={cn(
                  "flex h-auto flex-col items-center justify-center p-3",
                  isSelected && "ring-primary ring-2 ring-offset-2",
                  showBothTimes && "pb-4",
                )}
              >
                {/* Business Time */}
                <div className="font-medium">{slot.startTime}</div>

                {/* Business Timezone Abbreviation */}
                <div className="text-xs opacity-75">
                  {getTimezoneAbbreviation(businessTimezone)}
                </div>

                {/* Customer Time (if different) */}
                {showBothTimes && (
                  <div className="mt-1 border-t border-current/20 pt-1 text-xs">
                    <div className="font-medium">
                      {slot.customerTime?.split(" ")[0]}
                    </div>
                    <div className="opacity-75">
                      {getTimezoneAbbreviation(customerTimezone)}
                    </div>
                  </div>
                )}

                {/* Timezone Offset Badge */}
                {slot.timezoneOffset && Math.abs(slot.timezoneOffset) >= 1 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 px-1 py-0 text-xs"
                  >
                    {slot.timezoneOffset > 0 ? "+" : ""}
                    {slot.timezoneOffset}h
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* Timezone Information */}
        {hasSignificantTimeDifference && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Timezone Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
              <div>
                <div className="font-medium">Business Timezone</div>
                <div>{businessTimezone}</div>
              </div>
              <div>
                <div className="font-medium">Your Timezone</div>
                <div>{customerTimezone}</div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh Times
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
