"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getUserTimezone,
  convertAppointmentTimezones,
  formatAppointmentTimeDisplay,
  getTimezoneAbbreviation,
  type TimezoneConversionResult,
} from "@/lib/timezone-utils";
import { cn } from "@/lib/utils";

export interface TimezoneBookingSummaryProps {
  appointmentDate: string;
  appointmentTime: string;
  businessTimezone?: string;
  businessName: string;
  className?: string;
  compact?: boolean;
}

export function TimezoneBookingSummary({
  appointmentDate,
  appointmentTime,
  businessTimezone,
  businessName,
  className,
  compact = false,
}: TimezoneBookingSummaryProps) {
  const [customerTimezone] = useState(getUserTimezone());
  const [conversion, setConversion] = useState<TimezoneConversionResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert appointment times when data changes
  useEffect(() => {
    const convertTimes = async () => {
      if (!appointmentDate || !appointmentTime || !businessTimezone) {
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
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to convert timezones";
        setError(errorMessage);
        console.error("Timezone conversion error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    convertTimes();
  }, [appointmentDate, appointmentTime, businessTimezone, customerTimezone]);

  // If no business timezone, show simple format
  if (!businessTimezone) {
    return (
      <div className={cn("text-sm", className)}>
        <div className="font-medium">
          {appointmentDate} at {appointmentTime}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-gray-600",
          className,
        )}
      >
        <Clock className="h-4 w-4 animate-spin" />
        <span>Converting timezones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={cn("border-red-200", className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!conversion) {
    return (
      <div className={cn("text-sm", className)}>
        <div className="font-medium">
          {appointmentDate} at {appointmentTime}
        </div>
      </div>
    );
  }

  const hasSignificantTimeDifference = Math.abs(conversion.timezoneOffset) >= 1;
  const isDifferentDay =
    conversion.businessTime.date !== conversion.customerTime.date;

  if (compact) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>
            {formatAppointmentTimeDisplay(
              conversion.businessTime.date,
              conversion.businessTime.time,
              conversion.businessTime.timezone,
              false,
            )}
          </span>
          <Badge variant="secondary" className="text-xs">
            {getTimezoneAbbreviation(conversion.businessTime.timezone)}
          </Badge>
        </div>

        {hasSignificantTimeDifference && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Globe className="h-3 w-3" />
            <span>
              Your time:{" "}
              {formatAppointmentTimeDisplay(
                conversion.customerTime.date,
                conversion.customerTime.time,
                conversion.customerTime.timezone,
                false,
              )}
            </span>
            <Badge variant="outline" className="text-xs">
              {getTimezoneAbbreviation(conversion.customerTime.timezone)}
            </Badge>
          </div>
        )}

        {isDifferentDay && (
          <div className="text-xs text-amber-600">
            ⚠️ Different day in your timezone
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-blue-200 bg-blue-50", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Business Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
              <Clock className="h-4 w-4" />
              <span>Appointment Time ({businessName})</span>
            </div>
            <div className="pl-6">
              <div className="font-semibold text-blue-900">
                {formatAppointmentTimeDisplay(
                  conversion.businessTime.date,
                  conversion.businessTime.time,
                  conversion.businessTime.timezone,
                  false,
                )}
              </div>
              <div className="text-sm text-blue-700">
                {getTimezoneAbbreviation(conversion.businessTime.timezone)}
              </div>
            </div>
          </div>

          {/* Customer Time (only show if different) */}
          {hasSignificantTimeDifference && (
            <div className="space-y-1 border-t border-blue-200 pt-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                <Globe className="h-4 w-4" />
                <span>Your Local Time</span>
              </div>
              <div className="pl-6">
                <div className="font-semibold text-blue-900">
                  {formatAppointmentTimeDisplay(
                    conversion.customerTime.date,
                    conversion.customerTime.time,
                    conversion.customerTime.timezone,
                    false,
                  )}
                </div>
                <div className="text-sm text-blue-700">
                  {getTimezoneAbbreviation(conversion.customerTime.timezone)}
                </div>
              </div>
            </div>
          )}

          {/* Different Day Warning */}
          {isDifferentDay && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Note:</strong> Due to timezone differences, this
                appointment is on {conversion.customerTime.date} in your local
                time, but {conversion.businessTime.date} in the business's
                timezone.
              </AlertDescription>
            </Alert>
          )}

          {/* Timezone Offset Info */}
          {hasSignificantTimeDifference && (
            <div className="text-xs text-blue-600">
              Time difference: {conversion.timezoneOffset > 0 ? "+" : ""}
              {conversion.timezoneOffset} hours
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
