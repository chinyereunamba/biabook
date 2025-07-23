/**
 * Utility functions for validating availability data
 */

/**
 * Validates a time string in HH:MM format
 * @param time Time string to validate
 * @returns True if the time is in valid HH:MM format
 */
export function isValidTimeFormat(time: string | null | undefined): boolean {
  if (!time) return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

/**
 * Validates a date string in YYYY-MM-DD format
 * @param date Date string to validate
 * @returns True if the date is in valid YYYY-MM-DD format
 */
export function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Checks if end time is after start time
 * @param startTime Start time in HH:MM format
 * @param endTime End time in HH:MM format
 * @returns True if end time is after start time
 */
export function isEndTimeAfterStartTime(
  startTime: string,
  endTime: string,
): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  return startTime < endTime;
}

/**
 * Checks if two time ranges overlap
 * @param startTime1 Start time of first range in HH:MM format
 * @param endTime1 End time of first range in HH:MM format
 * @param startTime2 Start time of second range in HH:MM format
 * @param endTime2 End time of second range in HH:MM format
 * @returns True if the time ranges overlap
 */
export function isTimeOverlapping(
  startTime1: string,
  endTime1: string,
  startTime2: string,
  endTime2: string,
): boolean {
  if (
    !isValidTimeFormat(startTime1) ||
    !isValidTimeFormat(endTime1) ||
    !isValidTimeFormat(startTime2) ||
    !isValidTimeFormat(endTime2)
  ) {
    return false;
  }
  return startTime1 < endTime2 && startTime2 < endTime1;
}

/**
 * Validates a day of week value (0-6, Sunday-Saturday)
 * @param dayOfWeek Day of week to validate
 * @returns True if the day of week is valid
 */
export function isValidDayOfWeek(dayOfWeek: number): boolean {
  return Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6;
}

/**
 * Formats a Date object to YYYY-MM-DD string format
 * @param date Date object to convert
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const result = date.toISOString().split("T")[0];
  return result ?? "";
}

/**
 * Parses a YYYY-MM-DD date string to a Date object
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export function parseYYYYMMDDToDate(dateStr: string): Date | null {
  if (!isValidDateFormat(dateStr)) return null;

  // Create date with UTC time at 00:00:00
  const [year, month, day] = dateStr.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined)
    return null;
  const date = new Date(Date.UTC(year, month - 1, day));

  return date;
}

/**
 * Gets the day of week (0-6) for a date string
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Day of week (0-6, Sunday-Saturday) or -1 if invalid
 */
export function getDayOfWeekFromDate(dateStr: string): number {
  const date = parseYYYYMMDDToDate(dateStr);
  if (!date) return -1;
  return date.getUTCDay();
}

/**
 * Adds days to a date string and returns a new date string
 * @param dateStr Date string in YYYY-MM-DD format
 * @param days Number of days to add
 * @returns New date string in YYYY-MM-DD format or null if invalid
 */
export function addDaysToDateString(
  dateStr: string,
  days: number,
): string | null {
  const date = parseYYYYMMDDToDate(dateStr);
  if (!date) return null;

  date.setUTCDate(date.getUTCDate() + days);
  return formatDateToYYYYMMDD(date);
}

/**
 * Generates an array of date strings for a date range
 * @param startDateStr Start date in YYYY-MM-DD format
 * @param endDateStr End date in YYYY-MM-DD format
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function generateDateRange(
  startDateStr: string,
  endDateStr: string,
): string[] {
  const startDate = parseYYYYMMDDToDate(startDateStr);
  const endDate = parseYYYYMMDDToDate(endDateStr);

  if (!startDate || !endDate) return [];
  if (startDate > endDate) return [];

  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(formatDateToYYYYMMDD(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Converts minutes since midnight to HH:MM format
 * @param minutes Minutes since midnight
 * @returns Time in HH:MM format
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Converts HH:MM format to minutes since midnight
 * @param timeStr Time in HH:MM format
 * @returns Minutes since midnight or -1 if invalid
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!isValidTimeFormat(timeStr)) return -1;

  const [hours, minutes] = timeStr.split(":").map(Number);
  if (hours === undefined || minutes === undefined) return -1;
  return hours * 60 + minutes;
}

/**
 * Calculates the duration between two time strings in minutes
 * @param startTime Start time in HH:MM format
 * @param endTime End time in HH:MM format
 * @returns Duration in minutes or -1 if invalid
 */
export function calculateDurationInMinutes(
  startTime: string,
  endTime: string,
): number {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  if (startMinutes === -1 || endMinutes === -1) return -1;
  if (endMinutes <= startMinutes) return -1;

  return endMinutes - startMinutes;
}
