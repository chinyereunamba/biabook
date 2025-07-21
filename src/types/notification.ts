/**
 * Types of notifications that can be sent
 */
export type NotificationType =
  | "booking_confirmation"
  | "booking_reminder_24h"
  | "booking_reminder_2h"
  | "booking_cancellation"
  | "booking_rescheduled"
  | "business_new_booking"
  | "business_booking_cancelled"
  | "business_booking_reminder";

/**
 * Status of a notification in the queue
 */
export type NotificationStatus = "pending" | "processed" | "failed";

/**
 * Notification preferences for a business
 */
export interface NotificationPreferences {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  reminderEmail: boolean;
  reminderWhatsapp: boolean;
  reminderSms: boolean;
}
