/**
 * Format a date to a readable string (e.g., "Monday, January 1, 2023")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a time string (HH:MM) to a readable format (e.g., "9:00 AM")
 */
export function formatTime(time: string): string {
  // Parse the time string (HH:MM)
  const [hours, minutes] = time.split(":").map(Number);

  // Create a date object to use the built-in time formatting
  const date = new Date();
  date.setHours(hours ?? 0);
  date.setMinutes(minutes ?? 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a price in cents to a currency string (e.g., "$10.99")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format a phone number to a readable format (e.g., "(123) 456-7890")
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Check if the number is valid
  if (cleaned.length !== 10) {
    return phoneNumber; // Return original if not valid
  }

  // Format as (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Truncate a string to a maximum length and add ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength) + "...";
}

/**
 * Formats a date string (YYYY-MM-DD) into a localized, human-readable format.
 * This function is SSR-safe and ensures consistent output on both server and client.
 * @param dateStr The date string in YYYY-MM-DD format.
 * @returns A formatted date string (e.g., "Mon, Jan 1, 2023").
 */
export function formatLocalizedDate(dateStr: string): string {
  // Appending T00:00:00 ensures the date is parsed in the user's local timezone,
  // preventing the "off-by-one-day" error.
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
