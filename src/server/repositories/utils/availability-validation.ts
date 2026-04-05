import { parseISO, format, isValid, addDays, eachDayOfInterval } from "date-fns";

/**
 * Utility functions for validating availability data
 */

export function isValidTimeFormat(time: string | null | undefined): boolean {
  if (!time) return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

export function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isEndTimeAfterStartTime(
  startTime: string,
  endTime: string,
): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  return startTime < endTime;
}

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

export function isValidDayOfWeek(dayOfWeek: number): boolean {
  return Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6;
}

export function formatDateToYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseYYYYMMDDToDate(dateStr: string): Date | null {
  if (!isValidDateFormat(dateStr)) return null;
  // parseISO correctly handles 'yyyy-MM-dd' as midnight in system local time zone
  const date = parseISO(dateStr);
  return isValid(date) ? date : null;
}

export function getDayOfWeekFromDate(dateStr: string): number {
  const date = parseYYYYMMDDToDate(dateStr);
  if (!date) return -1;
  return date.getDay(); // 0-6 (Sunday-Saturday)
}

export function addDaysToDateString(
  dateStr: string,
  days: number,
): string | null {
  const date = parseYYYYMMDDToDate(dateStr);
  if (!date) return null;

  return format(addDays(date, days), "yyyy-MM-dd");
}

export function generateDateRange(
  startDateStr: string,
  endDateStr: string,
): string[] {
  const startDate = parseYYYYMMDDToDate(startDateStr);
  const endDate = parseYYYYMMDDToDate(endDateStr);

  if (!startDate || !endDate || startDate > endDate) return [];

  return eachDayOfInterval({ start: startDate, end: endDate }).map((d) =>
    format(d, "yyyy-MM-dd")
  );
}

export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function timeStringToMinutes(timeStr: string): number {
  if (!isValidTimeFormat(timeStr)) return -1;

  const [hours, minutes] = timeStr.split(":").map(Number);
  if (hours === undefined || minutes === undefined) return -1;
  return hours * 60 + minutes;
}

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
