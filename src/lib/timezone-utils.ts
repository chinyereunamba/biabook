/**
 * Timezone conversion utilities for appointments
 * Handles timezone-aware appointment scheduling and display
 */

import type { Coordinates } from "@/types/location";
import { LocationError, LocationErrorCode } from "@/types/location";
import { isValidTimezone } from "@/lib/location-validation";
import { timezoneService } from "@/lib/timezone-service";

/**
 * Appointment time with timezone information
 */
export interface AppointmentTime {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  timezone: string;
  displayTime: string; // Formatted time with timezone
}

/**
 * Appointment timezone conversion result
 */
export interface TimezoneConversionResult {
  businessTime: AppointmentTime;
  customerTime: AppointmentTime;
  timezoneOffset: number; // Hours difference (customer - business)
}

/**
 * Gets the user's current timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC"; // Fallback to UTC
  }
}

/**
 * Detects timezone from browser geolocation
 */
export async function detectTimezoneFromLocation(): Promise<string> {
  try {
    // Try to get user's current position
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      },
    );

    const coordinates: Coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };

    return await timezoneService.detectTimezone(coordinates);
  } catch {
    // Fallback to browser timezone
    return getUserTimezone();
  }
}

/**
 * Creates an appointment time object
 */
export function createAppointmentTime(
  date: string,
  time: string,
  timezone: string,
): AppointmentTime {
  if (!isValidTimezone(timezone)) {
    throw new LocationError(
      LocationErrorCode.TIMEZONE_DETECTION_FAILED,
      `Invalid timezone: ${timezone}`,
      "Please provide a valid timezone",
    );
  }

  // Create a Date object for the appointment
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if (!year || !month || !day || hour === undefined || minute === undefined) {
    throw new LocationError(
      LocationErrorCode.TIMEZONE_DETECTION_FAILED,
      "Invalid date or time format",
      "Please use YYYY-MM-DD for date and HH:MM for time",
    );
  }

  const appointmentDate = new Date(year, month - 1, day, hour, minute);
  const displayTime = timezoneService.formatTimeWithTimezone(
    appointmentDate,
    timezone,
  );

  return {
    date,
    time,
    timezone,
    displayTime,
  };
}

/**
 * Converts appointment time between timezones
 */
export async function convertAppointmentTime(
  appointmentTime: AppointmentTime,
  targetTimezone: string,
): Promise<AppointmentTime> {
  if (!isValidTimezone(targetTimezone)) {
    throw new LocationError(
      LocationErrorCode.TIMEZONE_DETECTION_FAILED,
      `Invalid target timezone: ${targetTimezone}`,
      "Please provide a valid timezone",
    );
  }

  try {
    // Parse the appointment time in the source timezone
    const [year, month, day] = appointmentTime.date.split("-").map(Number);
    const [hour, minute] = appointmentTime.time.split(":").map(Number);

    if (!year || !month || !day || hour === undefined || minute === undefined) {
      throw new Error("Invalid date or time format");
    }

    // Create date in source timezone
    const sourceDate = new Date();
    sourceDate.setFullYear(year, month - 1, day);
    sourceDate.setHours(hour, minute, 0, 0);

    // Convert to target timezone
    const targetDate = new Date(
      sourceDate.toLocaleString("en-US", { timeZone: targetTimezone }),
    );

    // Format the converted time
    const convertedDate = targetDate.toISOString().split("T")[0]!;
    const convertedTime = targetDate.toTimeString().slice(0, 5);
    const displayTime = timezoneService.formatTimeWithTimezone(
      targetDate,
      targetTimezone,
    );

    return {
      date: convertedDate,
      time: convertedTime,
      timezone: targetTimezone,
      displayTime,
    };
  } catch (error) {
    throw new LocationError(
      LocationErrorCode.TIMEZONE_DETECTION_FAILED,
      `Failed to convert appointment time: ${error instanceof Error ? error.message : "Unknown error"}`,
      "Please try again",
    );
  }
}

/**
 * Converts appointment between business and customer timezones
 */
export async function convertAppointmentTimezones(
  date: string,
  time: string,
  businessTimezone: string,
  customerTimezone?: string,
): Promise<TimezoneConversionResult> {
  const actualCustomerTimezone = customerTimezone || getUserTimezone();

  // Create business time
  const businessTime = createAppointmentTime(date, time, businessTimezone);

  // Convert to customer timezone
  const customerTime = await convertAppointmentTime(
    businessTime,
    actualCustomerTimezone,
  );

  // Calculate timezone offset in hours
  const businessDate = new Date(`${date}T${time}:00`);
  const customerDate = new Date(`${customerTime.date}T${customerTime.time}:00`);
  const timezoneOffset =
    (customerDate.getTime() - businessDate.getTime()) / (1000 * 60 * 60);

  return {
    businessTime,
    customerTime,
    timezoneOffset,
  };
}

/**
 * Formats appointment time for display with timezone context
 */
export function formatAppointmentTimeDisplay(
  date: string,
  time: string,
  timezone: string,
  showTimezone = true,
): string {
  try {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    if (!year || !month || !day || hour === undefined || minute === undefined) {
      return `${date} ${time}`;
    }

    const appointmentDate = new Date(year, month - 1, day, hour, minute);

    if (showTimezone) {
      return timezoneService.formatTimeWithTimezone(appointmentDate, timezone);
    } else {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(appointmentDate);
    }
  } catch {
    return `${date} ${time}`;
  }
}

/**
 * Gets available time slots in business timezone
 */
export function getAvailableTimeSlotsInTimezone(
  availableSlots: string[], // Array of HH:MM times
  date: string,
  businessTimezone: string,
): AppointmentTime[] {
  return availableSlots.map((time) =>
    createAppointmentTime(date, time, businessTimezone),
  );
}

/**
 * Checks if appointment time is in the future considering timezone
 */
export function isAppointmentInFuture(
  date: string,
  time: string,
  timezone: string,
): boolean {
  try {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    if (!year || !month || !day || hour === undefined || minute === undefined) {
      return false;
    }

    const appointmentDate = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    // Convert both times to the same timezone for comparison
    const appointmentInTimezone = new Date(
      appointmentDate.toLocaleString("en-US", { timeZone: timezone }),
    );
    const nowInTimezone = new Date(
      now.toLocaleString("en-US", { timeZone: timezone }),
    );

    return appointmentInTimezone > nowInTimezone;
  } catch {
    return false;
  }
}

/**
 * Gets timezone abbreviation for display
 */
export function getTimezoneAbbreviation(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });

    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find((part) => part.type === "timeZoneName");

    return timeZonePart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Validates appointment time format
 */
export function validateAppointmentTimeFormat(
  date: string,
  time: string,
): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^\d{2}:\d{2}$/;

  return dateRegex.test(date) && timeRegex.test(time);
}

/**
 * Creates a timezone-aware appointment booking payload
 */
export interface AppointmentBookingPayload {
  date: string;
  time: string;
  businessTimezone: string;
  customerTimezone: string;
  businessDisplayTime: string;
  customerDisplayTime: string;
}

export async function createAppointmentBookingPayload(
  date: string,
  time: string,
  businessTimezone: string,
  customerTimezone?: string,
): Promise<AppointmentBookingPayload> {
  const actualCustomerTimezone = customerTimezone || getUserTimezone();

  const conversion = await convertAppointmentTimezones(
    date,
    time,
    businessTimezone,
    actualCustomerTimezone,
  );

  return {
    date,
    time,
    businessTimezone,
    customerTimezone: actualCustomerTimezone,
    businessDisplayTime: conversion.businessTime.displayTime,
    customerDisplayTime: conversion.customerTime.displayTime,
  };
}
