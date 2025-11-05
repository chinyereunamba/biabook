"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Globe,
  MapPin,
  Info,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getUserTimezone,
  convertAppointmentTimezones,
  formatAppointmentTimeDisplay,
  getTimezoneAbbreviation,
  type TimezoneConversionResult,
} from "@/lib/timezone-utils";
import { cn } from "@/lib/utils";

export interface TimezoneAwareBookingProps {
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  businessTimezone: string;
  businessName: string;
  businessLocation?: string;
  onTimezoneUpdate?: (conversion: TimezoneConversionResult) => void;
  className?: string;
  showDetailed?: boolean;
}

export function TimezoneAwareBooking({
  appointmentDate,
  appointmentTime,
  businessTimezone,
  businessName,
  businessLocation,
  onTimezoneUpdate,
  className,
  showDetailed = true,
}: TimezoneAwareBookingProps) {
  const [customerTimezone, setCustomerTimezone] = useState<string>("");
  const [conversion, setConversion] = useState<TimezoneConversionResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize customer timezone
  useEffect(() => {
    const initializeTimezone = async () => {
      try {
        const timezone = getUserTimezone();
        setCustomerTimezone(timezone);
      } catch (err) {
        console.error("Failed to get user timezone:", err);
        setCustomerTimezone("UTC");
      }
    };

    initializeTimezone();
  }, []);

  // Convert appointment times when data changes
  const convertTimes = useCallback(async () => {
    if (
      !appointmentDate ||
      !appointmentTime ||
      !businessTimezone ||
      !customerTimezone
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await convertAppointmentTimezones(
        appointmentDate,
        appointmentTime,
        businessTimezone,
        customerTimezone,
      );

      setConversion(result);
      onTimezoneUpdate?.(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to convert timezones";
      setError(errorMessage);
      console.error("Timezone conversion error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    appointmentDate,
    appointmentTime,
    businessTimezone,
    customerTimezone,
    onTimezoneUpdate,
  ]);

  // Convert times when dependencies change
  useEffect(() => {
    convertTimes();
  }, [convertTimes]);

  // Refresh timezone conversion
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await convertTimes();
    setIsRefreshing(false);
  }, [convertTimes]);

  // Check if there's a significant timezone difference
  const hasSignificantTimeDifference =
    conversion && Math.abs(conversion.timezoneOffset) >= 1;
  const isDifferentDay =
    conversion && conversion.businessTime.date !== conversion.customerTime.date;

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Converting timezones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardContent className="p-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2"
              >
                <RefreshCw
                  className={cn("h-3 w-3", isRefreshing && "animate-spin")}
                />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!conversion) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Appointment Time
          {hasSignificantTimeDifference && (
            <Badge variant="secondary" className="text-xs">
              {conversion.timezoneOffset > 0 ? "+" : ""}
              {conversion.timezoneOffset}h
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Business Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="h-4 w-4" />
            <span>Business Time ({businessName})</span>
          </div>
          <div className="pl-6">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatAppointmentTimeDisplay(
                conversion.businessTime.date,
                conversion.businessTime.time,
                conversion.businessTime.timezone,
                false,
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getTimezoneAbbreviation(conversion.businessTime.timezone)}
              {businessLocation && (
                <span className="ml-2">• {businessLocation}</span>
              )}
            </div>
          </div>
        </div>

        {/* Customer Time (only show if different) */}
        {hasSignificantTimeDifference && (
          <>
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Globe className="h-4 w-4" />
                <span>Your Local Time</span>
              </div>
              <div className="pl-6">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatAppointmentTimeDisplay(
                    conversion.customerTime.date,
                    conversion.customerTime.time,
                    conversion.customerTime.timezone,
                    false,
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getTimezoneAbbreviation(conversion.customerTime.timezone)}
                </div>
              </div>
            </div>

            {/* Different Day Warning */}
            {isDifferentDay && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Due to timezone differences, this
                  appointment is on {conversion.customerTime.date} in your local
                  time, but
                  {conversion.businessTime.date} in the business's timezone.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Detailed Information */}
        {showDetailed && hasSignificantTimeDifference && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Timezone Details
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
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Time difference: {conversion.timezoneOffset > 0 ? "+" : ""}
              {conversion.timezoneOffset} hours
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw
              className={cn("mr-1 h-3 w-3", isRefreshing && "animate-spin")}
            />
            Update Times
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for inline display
export interface CompactTimezoneDisplayProps {
  appointmentDate: string;
  appointmentTime: string;
  businessTimezone: string;
  className?: string;
}

export function CompactTimezoneDisplay({
  appointmentDate,
  appointmentTime,
  businessTimezone,
  className,
}: CompactTimezoneDisplayProps) {
  const [conversion, setConversion] = useState<TimezoneConversionResult | null>(
    null,
  );
  const [customerTimezone] = useState(getUserTimezone());

  useEffect(() => {
    const convertTimes = async () => {
      try {
        const result = await convertAppointmentTimezones(
          appointmentDate,
          appointmentTime,
          businessTimezone,
          customerTimezone,
        );
        setConversion(result);
      } catch (err) {
        console.error("Failed to convert times:", err);
      }
    };

    convertTimes();
  }, [appointmentDate, appointmentTime, businessTimezone, customerTimezone]);

  if (!conversion) {
    return (
      <div className={cn("text-sm text-gray-600", className)}>
        {appointmentDate} at {appointmentTime}
      </div>
    );
  }

  const hasTimeDifference = Math.abs(conversion.timezoneOffset) >= 1;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-sm font-medium">
        {formatAppointmentTimeDisplay(
          conversion.businessTime.date,
          conversion.businessTime.time,
          conversion.businessTime.timezone,
          false,
        )}
        <span className="ml-2 text-xs text-gray-500">
          ({getTimezoneAbbreviation(conversion.businessTime.timezone)})
        </span>
      </div>

      {hasTimeDifference && (
        <div className="text-xs text-gray-600">
          Your time:{" "}
          {formatAppointmentTimeDisplay(
            conversion.customerTime.date,
            conversion.customerTime.time,
            conversion.customerTime.timezone,
            false,
          )}
          <span className="ml-1">
            ({getTimezoneAbbreviation(conversion.customerTime.timezone)})
          </span>
        </div>
      )}
    </div>
  );
}
