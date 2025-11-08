# 30-Minute Reminder - Quick Start Guide

## What's New?

BiaBook now sends a reminder notification **30 minutes before** each appointment, in addition to the existing 24-hour and 2-hour reminders.

## For Developers

### Quick Test

```bash
# Verify the implementation
bun run scripts/verify-30min-reminder.ts
```

### Check Scheduled Reminders

```sql
-- View all 30-minute reminders
SELECT * FROM biabook_notification_queue
WHERE type = 'booking_reminder_30m'
ORDER BY scheduled_for DESC;
```

### Create a Test Booking

```typescript
// The 30-minute reminder will be automatically scheduled
const appointment = await createBooking({
  businessId: "your-business-id",
  serviceId: "your-service-id",
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  customerPhone: "1234567890",
  appointmentDate: "2024-03-15",
  startTime: "14:00",
  endTime: "15:00",
});

// Check the notification queue
// You should see entries for:
// - booking_confirmation (immediate)
// - booking_reminder_24h (24 hours before)
// - booking_reminder_2h (2 hours before)
// - booking_reminder_30m (30 minutes before) ✨ NEW
```

## For Business Owners

### What You Need to Know

1. **Automatic** - No configuration needed, it just works
2. **Smart** - Only sends if the reminder time is in the future
3. **Multi-channel** - Sent via email and WhatsApp (if enabled)
4. **Free** - No additional cost for this feature

### Example Timeline

If a customer books an appointment for **2:00 PM on Friday**:

- **Thursday at 2:00 PM** → 24-hour reminder
- **Friday at 12:00 PM** → 2-hour reminder
- **Friday at 1:30 PM** → 30-minute reminder ✨ NEW
- **Friday at 2:00 PM** → Appointment time

### Benefits

- **Fewer no-shows** - Last-minute reminder catches forgetful customers
- **Better punctuality** - Customers have time to leave and arrive on time
- **Improved experience** - Customers appreciate the helpful reminders

## For Customers

### What to Expect

When you book an appointment, you'll receive:

1. **Immediate confirmation** - Right after booking
2. **Day-before reminder** - 24 hours before your appointment
3. **Same-day reminder** - 2 hours before your appointment
4. **Final reminder** - 30 minutes before your appointment ✨ NEW

### Notification Channels

- **Email** - Always sent to your email address
- **WhatsApp** - If the business has it enabled
- **SMS** - If the business has it enabled

## Troubleshooting

### Not Receiving 30-Minute Reminders?

1. **Check your booking time** - If you booked less than 30 minutes before the appointment, the reminder won't be scheduled
2. **Check spam folder** - Email reminders might be in spam
3. **Verify email address** - Make sure you provided the correct email when booking
4. **Contact the business** - They can check the notification queue

### For Developers: Debugging

```bash
# Check notification queue status
sqlite3 db.sqlite "SELECT COUNT(*) FROM biabook_notification_queue WHERE type = 'booking_reminder_30m' AND status = 'pending';"

# View failed notifications
sqlite3 db.sqlite "SELECT * FROM biabook_notification_queue WHERE type = 'booking_reminder_30m' AND status = 'failed' LIMIT 5;"

# Check notification processing logs
# (Logs are in your application logs)
```

## API Reference

### Notification Type

```typescript
type NotificationType =
  | "booking_reminder_30m"  // 30-minute reminder
  | ... // other types
```

### Scheduling

```typescript
// Automatically called when creating a booking
await notificationScheduler.scheduleBookingReminders(
  appointment,
  service,
  business,
);
```

### Processing

```typescript
// Process pending notifications
await notificationScheduler.processPendingNotifications(10);
```

## Configuration

### Environment Variables

No additional configuration needed! The 30-minute reminder uses the same email and WhatsApp settings as other notifications.

```env
# Email (required)
EMAIL_FROM="your-email@domain.com"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-username"
EMAIL_SERVER_PASSWORD="your-password"

# WhatsApp (optional)
WHATSAPP_API_URL="https://graph.facebook.com/v22.0"
WHATSAPP_PHONE_NUMBER_ID="your-phone-id"
WHATSAPP_ACCESS_TOKEN="your-token"
```

## Support

- **Documentation**: See `NOTIFICATION_REMINDERS.md` for detailed information
- **Changelog**: See `CHANGELOG_30MIN_REMINDER.md` for implementation details
- **Issues**: Check the notification queue and logs for debugging

## Summary

✅ **Implemented** - 30-minute reminder is live and working  
✅ **Tested** - Verification script confirms correct functionality  
✅ **Documented** - Comprehensive documentation available  
✅ **Backward Compatible** - No breaking changes

The 30-minute reminder feature is ready to use!
