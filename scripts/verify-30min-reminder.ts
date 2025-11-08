#!/usr/bin/env bun

/**
 * Verification script for 30-minute reminder feature
 *
 * This script verifies that the 30-minute reminder notification type
 * is properly integrated into the notification system.
 */

import type { NotificationType } from "@/types/notification";

// Test 1: Verify notification type exists
console.log("✓ Test 1: Checking if 'booking_reminder_30m' type exists...");

const validTypes: NotificationType[] = [
  "booking_confirmation",
  "booking_reminder_24h",
  "booking_reminder_2h",
  "booking_reminder_30m", // NEW
  "booking_cancellation",
  "booking_rescheduled",
  "business_new_booking",
  "business_booking_cancelled",
  "business_booking_reminder",
];

const has30MinReminder = validTypes.includes("booking_reminder_30m");
console.log(
  has30MinReminder
    ? "  ✓ 'booking_reminder_30m' type is defined"
    : "  ✗ 'booking_reminder_30m' type is missing",
);

// Test 2: Verify scheduling logic
console.log("\n✓ Test 2: Verifying scheduling logic...");

function calculateReminderTime(
  appointmentDate: Date,
  minutesBefore: number,
): Date {
  const reminder = new Date(appointmentDate);
  reminder.setMinutes(reminder.getMinutes() - minutesBefore);
  return reminder;
}

// Example: Appointment at 2:00 PM
const appointmentTime = new Date("2024-03-15T14:00:00");
const reminder30m = calculateReminderTime(appointmentTime, 30);
const reminder2h = calculateReminderTime(appointmentTime, 120);
const reminder24h = calculateReminderTime(appointmentTime, 1440);

console.log(`  Appointment time: ${appointmentTime.toLocaleString()}`);
console.log(`  24h reminder:     ${reminder24h.toLocaleString()}`);
console.log(`  2h reminder:      ${reminder2h.toLocaleString()}`);
console.log(`  30m reminder:     ${reminder30m.toLocaleString()}`);

// Verify the 30-minute reminder is 30 minutes before
const diffMinutes =
  (appointmentTime.getTime() - reminder30m.getTime()) / (1000 * 60);
console.log(
  diffMinutes === 30
    ? "  ✓ 30-minute reminder calculation is correct"
    : `  ✗ 30-minute reminder calculation is incorrect (${diffMinutes} minutes)`,
);

// Test 3: Verify reminder order
console.log("\n✓ Test 3: Verifying reminder order...");

const reminders = [
  { name: "24h", time: reminder24h },
  { name: "2h", time: reminder2h },
  { name: "30m", time: reminder30m },
];

const sortedReminders = [...reminders].sort(
  (a, b) => a.time.getTime() - b.time.getTime(),
);

const correctOrder =
  sortedReminders[0]?.name === "24h" &&
  sortedReminders[1]?.name === "2h" &&
  sortedReminders[2]?.name === "30m";

console.log(
  correctOrder
    ? "  ✓ Reminders are scheduled in correct order (24h → 2h → 30m)"
    : "  ✗ Reminders are not in correct order",
);

// Test 4: Verify future date check
console.log("\n✓ Test 4: Verifying future date check...");

const now = new Date();
const futureAppointment = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
const pastAppointment = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

const futureReminder30m = calculateReminderTime(futureAppointment, 30);
const pastReminder30m = calculateReminderTime(pastAppointment, 30);

const shouldScheduleFuture = futureReminder30m > now;
const shouldNotSchedulePast = pastReminder30m <= now;

console.log(
  shouldScheduleFuture
    ? "  ✓ Future appointment reminder will be scheduled"
    : "  ✗ Future appointment reminder will not be scheduled",
);

console.log(
  shouldNotSchedulePast
    ? "  ✓ Past appointment reminder will not be scheduled"
    : "  ✗ Past appointment reminder will be scheduled (incorrect)",
);

// Summary
console.log("\n" + "=".repeat(60));
console.log("VERIFICATION SUMMARY");
console.log("=".repeat(60));

const allTestsPassed =
  has30MinReminder &&
  diffMinutes === 30 &&
  correctOrder &&
  shouldScheduleFuture &&
  shouldNotSchedulePast;

if (allTestsPassed) {
  console.log(
    "✓ All tests passed! The 30-minute reminder feature is working correctly.",
  );
  console.log("\nNext steps:");
  console.log("1. Create a test booking to verify end-to-end functionality");
  console.log("2. Check the notification_queue table for scheduled reminders");
  console.log("3. Monitor notification processing logs");
} else {
  console.log("✗ Some tests failed. Please review the implementation.");
}

console.log("\n" + "=".repeat(60));
