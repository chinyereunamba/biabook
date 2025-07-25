/**
 * Date utility functions for consistent date handling across the application
 * All dates should be in YYYY-MM-DD format to avoid timezone issues
 */

/**
 * Formats a Date object to YYYY-MM-DD string format using local time
 * This avoids timezone conversion issues that occur with toISOString()
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date in YYYY-MM-DD format using local time
 */
export function getTodayDateString(): string {
  return formatDateToYYYYMMDD(new Date());
}

/**
 * Parses a YYYY-MM-DD date string to a Date object in local time
 * This avoids timezone issues that can occur with new Date(dateString)
 */
export function parseYYYYMMDDToLocalDate(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;

  const [, year, month, day] = match;
  if (!year || !month || !day) return null;

  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Checks if a date string is in the past (compared to today)
 */
export function isDateInPast(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr < today;
}

/**
 * Adds days to a date string and returns a new date string
 */
export function addDaysToDateString(
  dateStr: string,
  days: number,
): string | null {
  const date = parseYYYYMMDDToLocalDate(dateStr);
  if (!date) return null;

  date.setDate(date.getDate() + days);
  return formatDateToYYYYMMDD(date);
}

/**
 * Gets the day of week for a date string (0 = Sunday, 6 = Saturday)
 * This matches the server-side implementation but uses local time
 */
export function getDayOfWeekFromDateString(dateStr: string): number {
  const date = parseYYYYMMDDToLocalDate(dateStr);
  if (!date) return -1;
  return date.getDay();
}
