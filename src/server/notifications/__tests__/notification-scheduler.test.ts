import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationScheduler } from "../notification-scheduler";
import { notificationQueueService } from "../notification-queue";

// Mock dependencies
vi.mock("../notification-queue", () => ({
  notificationQueueService: {
    enqueue: vi.fn().mockResolvedValue("queue-item-id"),
    getPendingNotifications: vi.fn(),
    markAsProcessed: vi.fn(),
    markAsFailed: vi.fn(),
  },
}));

vi.mock("../notification-service", () => ({
  notificationService: {
    sendBookingConfirmationToCustomer: vi.fn().mockResolvedValue(true),
    sendBookingNotificationToBusiness: vi.fn().mockResolvedValue(true),
    sendBookingCancellationToCustomer: vi.fn().mockResolvedValue(true),
    sendBookingReminderToCustomer: vi.fn().mockResolvedValue(true),
    sendBookingRescheduledToCustomer: vi.fn().mockResolvedValue(true),
    sendCancellationNotificationToBusiness: vi.fn().mockResolvedValue(true),
    sendReminderNotificationToBusiness: vi.fn().mockResolvedValue(true),
  },
}));

// Mock database
vi.mock("@/server/db", () => {
  const mockResults = {
    // Mock business notification preferences
    preferences: [{ businessId: "biz-123", email: true, whatsapp: true }],
    // Mock appointment
    appointment: [
      {
        id: "appt-123",
        businessId: "biz-123",
        serviceId: "svc-123",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "1234567890",
        appointmentDate: "2023-12-01",
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
      },
    ],
    // Mock service
    service: [
      {
        id: "svc-123",
        businessId: "biz-123",
        name: "Haircut",
        description: "Standard haircut",
        duration: 60,
        price: 2500,
        isActive: true,
      },
    ],
    // Mock business
    business: [
      {
        id: "biz-123",
        name: "Hair Salon",
        slug: "hair-salon",
        email: "salon@example.com",
        phone: "+15551234567",
      },
    ],
  };

  return {
    db: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn((num) => {
        if (num === 1) {
          // This is a hack to make the test work
          // We're checking which table is being queried based on the mock chain
          const mockChain = {
            from: {
              tableName: "",
            },
          };

          if (mockChain.from.tableName === "businessNotificationPreferences") {
            return mockResults.preferences;
          } else if (mockChain.from.tableName === "appointments") {
            return mockResults.appointment;
          } else if (mockChain.from.tableName === "services") {
            return mockResults.service;
          } else if (mockChain.from.tableName === "businesses") {
            return mockResults.business;
          }
        }
        return [];
      }),
    },
  };
});

describe("NotificationScheduler", () => {
  let notificationScheduler: NotificationScheduler;

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
    description: "Professional hair salon",
    email: "salon@example.com",
    phone: "+15551234567",
    ownerId: "user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  beforeEach(() => {
    notificationScheduler = new NotificationScheduler();
    vi.clearAllMocks();

    // Mock the getBusinessNotificationPreferences method
    (notificationScheduler as any).getBusinessNotificationPreferences = vi
      .fn()
      .mockResolvedValue({
        businessId: "biz-123",
        email: true,
        whatsapp: true,
        sms: false,
        reminderEmail: true,
        reminderWhatsapp: true,
        reminderSms: false,
      });

    // Mock the database methods
    (notificationScheduler as any).getAppointmentById = vi
      .fn()
      .mockResolvedValue(appointment);
    (notificationScheduler as any).getServiceById = vi
      .fn()
      .mockResolvedValue(service);
    (notificationScheduler as any).getBusinessById = vi
      .fn()
      .mockResolvedValue(business);
  });

  it("should schedule booking confirmation notifications", async () => {
    await notificationScheduler.scheduleBookingConfirmation(
      appointment,
      service,
      business,
    );

    // Should enqueue customer confirmation
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "booking_confirmation",
        recipientId: "john@example.com",
        recipientType: "customer",
        recipientEmail: "john@example.com",
        recipientPhone: "1234567890",
        payload: expect.objectContaining({
          appointmentId: "appt-123",
          serviceId: "svc-123",
          businessId: "biz-123",
        }),
      }),
    );

    // Should enqueue business notification
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "business_new_booking",
        recipientId: "biz-123",
        recipientType: "business",
        recipientEmail: "salon@example.com",
        recipientPhone: "+15551234567",
        payload: expect.objectContaining({
          appointmentId: "appt-123",
          serviceId: "svc-123",
          businessId: "biz-123",
        }),
      }),
    );
  });

  it("should schedule booking reminder notifications", async () => {
    // Set appointment date to future to ensure reminders are scheduled
    const futureAppointment = {
      ...appointment,
      appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours in the future
    };

    await notificationScheduler.scheduleBookingReminders(
      futureAppointment,
      service,
      business,
    );

    // Should enqueue 24-hour customer reminder
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "booking_reminder_24h",
        recipientId: "john@example.com",
        recipientType: "customer",
      }),
    );

    // Should enqueue 2-hour customer reminder
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "booking_reminder_2h",
        recipientId: "john@example.com",
        recipientType: "customer",
      }),
    );

    // Should enqueue 30-minute customer reminder
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "booking_reminder_30m",
        recipientId: "john@example.com",
        recipientType: "customer",
      }),
    );

    // Should enqueue business reminder
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "business_booking_reminder",
        recipientId: "biz-123",
        recipientType: "business",
      }),
    );
  });

  it("should schedule booking cancellation notifications", async () => {
    await notificationScheduler.scheduleBookingCancellation(
      appointment,
      service,
      business,
    );

    // Should enqueue customer cancellation
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "booking_cancellation",
        recipientId: "john@example.com",
        recipientType: "customer",
      }),
    );

    // Should enqueue business cancellation
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "business_booking_cancelled",
        recipientId: "biz-123",
        recipientType: "business",
      }),
    );
  });

  it("should schedule booking rescheduled notifications", async () => {
    await notificationScheduler.scheduleBookingRescheduled(
      appointment,
      service,
      business,
    );

    // Should enqueue customer rescheduled notification
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "booking_rescheduled",
        recipientId: "john@example.com",
        recipientType: "customer",
      }),
    );

    // Should enqueue business rescheduled notification
    expect(notificationQueueService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "business_booking_rescheduled",
        recipientId: "biz-123",
        recipientType: "business",
      }),
    );
  });
});
