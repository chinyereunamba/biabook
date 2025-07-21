import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AppointmentRepository } from "../appointment-repository";
import { db } from "@/server/db";
import {
  appointments,
  services,
  businesses,
  users,
  categories,
} from "@/server/db/schema";
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/types/booking";

// Mock the database
vi.mock("@/server/db", () => {
  const mockDb = {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnValue([]),
    query: {
      appointments: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      services: {
        findFirst: vi.fn(),
      },
    },
  };

  return { db: mockDb };
});

// Mock the notification scheduler
vi.mock("@/server/notifications/notification-scheduler", () => {
  return {
    notificationScheduler: {
      scheduleBookingConfirmation: vi.fn(),
      scheduleBookingReminders: vi.fn(),
      scheduleBookingCancellation: vi.fn(),
      scheduleBookingRescheduled: vi.fn(),
    },
  };
});

describe("AppointmentRepository", () => {
  let repository: AppointmentRepository;
  const mockAppointment = {
    id: "appt-123",
    businessId: "biz-123",
    serviceId: "svc-123",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "123-456-7890",
    appointmentDate: "2025-07-20",
    startTime: "10:00",
    endTime: "11:00",
    status: "pending",
    notes: "Test notes",
    confirmationNumber: "ABC123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AppointmentRepository();
  });

  describe("create", () => {
    it("should create a new appointment", async () => {
      // Mock service lookup
      vi.mocked(db.query.services.findFirst).mockResolvedValueOnce({
        id: "svc-123",
        businessId: "biz-123",
        name: "Test Service",
        description: "Test Description",
        duration: 60,
        price: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock insert returning
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValueOnce([mockAppointment]),
      } as any);

      const input: CreateAppointmentInput = {
        businessId: "biz-123",
        serviceId: "svc-123",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "123-456-7890",
        appointmentDate: "2025-07-20",
        startTime: "10:00",
        notes: "Test notes",
      };

      const result = await repository.create(input);
      expect(result).toEqual(mockAppointment);
      expect(db.insert).toHaveBeenCalledWith(appointments);
    });
  });

  // Add more tests as needed
});
