import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "../notification-service";
import { emailService } from "../email-service";
import * as emailTemplates from "../email-templates";

// Mock dependencies
vi.mock("../email-service", () => ({
  emailService: {
    sendEmail: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("../email-templates", () => ({
  bookingConfirmationEmail: vi
    .fn()
    .mockReturnValue("<html>Confirmation</html>"),
  bookingCancellationEmail: vi
    .fn()
    .mockReturnValue("<html>Cancellation</html>"),
  bookingReminderEmail: vi.fn().mockReturnValue("<html>Reminder</html>"),
  bookingRescheduledEmail: vi.fn().mockReturnValue("<html>Rescheduled</html>"),
  businessNewBookingEmail: vi.fn().mockReturnValue("<html>New Booking</html>"),
}));

// Mock environment variables
vi.mock("process", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "https://bookme.example.com",
  },
}));

describe("NotificationService", () => {
  let notificationService: NotificationService;

  // Test data
  const appointment = {
    id: "appt-123",
    businessId: "biz-123",
    serviceId: "svc-123",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "1234567890",
    appointmentDate: new Date("2023-12-01"),
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  const service = {
    id: "svc-123",
    businessId: "biz-123",
    name: "Haircut",
    description: "Standard haircut",
    duration: 60,
    price: 2500, // $25.00
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  const business = {
    id: "biz-123",
    name: "Hair Salon",
    slug: "hair-salon",
    email: "salon@example.com",
    userId: "user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    notificationService = new NotificationService();
  });

  it("should send booking confirmation email to customer", async () => {
    const result = await notificationService.sendBookingConfirmationToCustomer(
      appointment,
      service,
      business,
    );

    expect(result).toBe(true);
    expect(emailTemplates.bookingConfirmationEmail).toHaveBeenCalledWith(
      appointment,
      service,
      business,
      "https://bookme.example.com/booking/appt-123/cancel",
      "https://bookme.example.com/booking/appt-123/reschedule",
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: "john@example.com",
      subject: "Booking Confirmation - Hair Salon",
      html: "<html>Confirmation</html>",
    });
  });

  it("should send booking notification email to business", async () => {
    const result = await notificationService.sendBookingNotificationToBusiness(
      appointment,
      service,
      business,
    );

    expect(result).toBe(true);
    expect(emailTemplates.businessNewBookingEmail).toHaveBeenCalledWith(
      appointment,
      service,
      "https://bookme.example.com/dashboard/bookings/appt-123",
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: "salon@example.com",
      subject: "New Booking - John Doe",
      html: "<html>New Booking</html>",
    });
  });

  it("should send booking cancellation email to customer", async () => {
    const result = await notificationService.sendBookingCancellationToCustomer(
      appointment,
      service,
      business,
    );

    expect(result).toBe(true);
    expect(emailTemplates.bookingCancellationEmail).toHaveBeenCalledWith(
      appointment,
      service,
      business,
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: "john@example.com",
      subject: "Booking Cancelled - Hair Salon",
      html: "<html>Cancellation</html>",
    });
  });

  it("should send booking reminder email to customer", async () => {
    const result = await notificationService.sendBookingReminderToCustomer(
      appointment,
      service,
      business,
    );

    expect(result).toBe(true);
    expect(emailTemplates.bookingReminderEmail).toHaveBeenCalledWith(
      appointment,
      service,
      business,
      "https://bookme.example.com/booking/appt-123/cancel",
      "https://bookme.example.com/booking/appt-123/reschedule",
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: "john@example.com",
      subject: "Reminder: Your Appointment with Hair Salon",
      html: "<html>Reminder</html>",
    });
  });

  it("should send booking rescheduled email to customer", async () => {
    const result = await notificationService.sendBookingRescheduledToCustomer(
      appointment,
      service,
      business,
    );

    expect(result).toBe(true);
    expect(emailTemplates.bookingRescheduledEmail).toHaveBeenCalledWith(
      appointment,
      service,
      business,
      "https://bookme.example.com/booking/appt-123/cancel",
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: "john@example.com",
      subject: "Booking Rescheduled - Hair Salon",
      html: "<html>Rescheduled</html>",
    });
  });
});
