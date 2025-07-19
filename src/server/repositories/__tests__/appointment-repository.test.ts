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
  return {
    db: {
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      select: vi.fn(),
      query: {
        appointments: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        services: {
          findFirst: vi.fn(),
        },
      },
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
    updatedAt: null,
  };

  const mockService = {
    id: "svc-123",
    businessId: "biz-123",
    name: "Haircut",
    description: "Basic haircut",
    duration: 60,
    price: 2500,
    isActive: true,
    category: "Hair",
    bufferTime: 15,
    createdAt: new Date(),
    updatedAt: null,
  };

  const mockBusiness = {
    id: "biz-123",
    name: "Test Salon",
    description: "A test salon",
    location: "123 Test St",
    phone: "123-456-7890",
    email: "salon@example.com",
    categoryId: "cat-123",
    ownerId: "user-123",
    createdAt: new Date(),
    updatedAt: null,
  };

  beforeEach(() => {
    repository = new AppointmentRepository();
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new appointment", async () => {
      // Mock service query
      (db.query.services.findFirst as any).mockResolvedValue(mockService);

      // Mock conflict check
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue([]),
        }),
      });

      // Mock insert
      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAppointment]),
        }),
      });

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
      expect(db.query.services.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
      });
      expect(db.insert).toHaveBeenCalledWith(appointments);
    });

    it("should throw an error if service is not found", async () => {
      (db.query.services.findFirst as any).mockResolvedValue(null);

      const input: CreateAppointmentInput = {
        businessId: "biz-123",
        serviceId: "svc-123",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "123-456-7890",
        appointmentDate: "2025-07-20",
        startTime: "10:00",
      };

      await expect(repository.create(input)).rejects.toThrow(
        "Service with ID svc-123 not found",
      );
    });

    it("should throw an error if there's a booking conflict", async () => {
      (db.query.services.findFirst as any).mockResolvedValue(mockService);

      // Mock conflict check to return a conflict
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue([mockAppointment]),
        }),
      });

      const input: CreateAppointmentInput = {
        businessId: "biz-123",
        serviceId: "svc-123",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "123-456-7890",
        appointmentDate: "2025-07-20",
        startTime: "10:00",
      };

      await expect(repository.create(input)).rejects.toThrow(
        "This time slot is no longer available",
      );
    });
  });

  describe("getById", () => {
    it("should return an appointment by ID", async () => {
      const mockAppointmentWithDetails = {
        ...mockAppointment,
        business: mockBusiness,
        service: mockService,
      };

      (db.query.appointments.findFirst as any).mockResolvedValue(
        mockAppointmentWithDetails,
      );

      const result = await repository.getById("appt-123");

      expect(result).toEqual(mockAppointmentWithDetails);
      expect(db.query.appointments.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
        with: {
          business: true,
          service: true,
        },
      });
    });

    it("should return null if appointment is not found", async () => {
      (db.query.appointments.findFirst as any).mockResolvedValue(null);

      const result = await repository.getById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getByConfirmationNumber", () => {
    it("should return an appointment by confirmation number", async () => {
      const mockAppointmentWithDetails = {
        ...mockAppointment,
        business: mockBusiness,
        service: mockService,
      };

      (db.query.appointments.findFirst as any).mockResolvedValue(
        mockAppointmentWithDetails,
      );

      const result = await repository.getByConfirmationNumber("ABC123");

      expect(result).toEqual(mockAppointmentWithDetails);
      expect(db.query.appointments.findFirst).toHaveBeenCalledWith({
        where: expect.anything(),
        with: {
          business: true,
          service: true,
        },
      });
    });
  });

  describe("getByBusiness", () => {
    it("should return appointments for a business with pagination", async () => {
      const mockAppointmentsWithDetails = [
        {
          ...mockAppointment,
          business: mockBusiness,
          service: mockService,
        },
      ];

      // Mock count query
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      // Mock appointments query
      (db.query.appointments.findMany as any).mockResolvedValue(
        mockAppointmentsWithDetails,
      );

      const result = await repository.getByBusiness("biz-123", {
        status: "pending",
        from: "2025-07-01",
        to: "2025-07-31",
        search: "John",
        limit: 10,
        offset: 0,
        sortBy: "date",
        sortDirection: "desc",
      });

      expect(result).toEqual({
        appointments: mockAppointmentsWithDetails,
        total: 1,
      });
      expect(db.query.appointments.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
          with: {
            business: true,
            service: true,
          },
          limit: 10,
          offset: 0,
        }),
      );
    });
  });

  describe("update", () => {
    it("should update an appointment", async () => {
      // Mock appointment query
      (db.query.appointments.findFirst as any).mockResolvedValue(
        mockAppointment,
      );

      // Mock update
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                ...mockAppointment,
                status: "confirmed",
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      });

      const input: UpdateAppointmentInput = {
        status: "confirmed",
      };

      const result = await repository.update("appt-123", input);

      expect(result.status).toBe("confirmed");
      expect(db.update).toHaveBeenCalledWith(appointments);
    });

    it("should throw an error if appointment is not found", async () => {
      (db.query.appointments.findFirst as any).mockResolvedValue(null);

      await expect(
        repository.update("non-existent", { status: "confirmed" }),
      ).rejects.toThrow("Appointment with ID non-existent not found");
    });
  });

  describe("updateStatus", () => {
    it("should update appointment status", async () => {
      // Mock update
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {
                ...mockAppointment,
                status: "confirmed",
                updatedAt: new Date(),
              },
            ]),
          }),
        }),
      });

      const result = await repository.updateStatus("appt-123", "confirmed");

      expect(result.status).toBe("confirmed");
      expect(db.update).toHaveBeenCalledWith(appointments);
    });

    it("should throw an error if appointment is not found", async () => {
      // Mock update to return empty array
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        repository.updateStatus("non-existent", "confirmed"),
      ).rejects.toThrow("Appointment with ID non-existent not found");
    });
  });

  describe("delete", () => {
    it("should delete an appointment", async () => {
      // Mock delete
      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "appt-123" }]),
        }),
      });

      const result = await repository.delete("appt-123");

      expect(result).toBe(true);
      expect(db.delete).toHaveBeenCalledWith(appointments);
    });

    it("should return false if appointment is not found", async () => {
      // Mock delete to return empty array
      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.delete("non-existent");

      expect(result).toBe(false);
    });
  });

  describe("checkForConflicts", () => {
    it("should return conflicts if they exist", async () => {
      // Mock select
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue([mockAppointment]),
        }),
      });

      const result = await repository.checkForConflicts(
        "biz-123",
        "2025-07-20",
        "10:00",
        "11:00",
      );

      expect(result).toEqual([mockAppointment]);
    });

    it("should exclude the specified appointment ID", async () => {
      // Mock select with where chain
      const whereMock = vi.fn().mockReturnValue([]);
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: whereMock,
        }),
      });

      await repository.checkForConflicts(
        "biz-123",
        "2025-07-20",
        "10:00",
        "11:00",
        "appt-123",
      );

      // Verify that where was called twice (once for main conditions, once for exclusion)
      expect(whereMock).toHaveBeenCalledTimes(2);
    });
  });
});
