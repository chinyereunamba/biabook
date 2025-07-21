import { describe, it, expect, vi, beforeEach } from "vitest";
import { WhatsAppService } from "../whatsapp-service";
import { formatDate, formatTime, formatCurrency } from "@/utils/format";

// Mock fetch
global.fetch = vi.fn();

// Mock environment variables
vi.mock("@/env", () => ({
  env: {
    WHATSAPP_API_URL: "env.WHATSAPP_API_URL!",
    WHATSAPP_PHONE_NUMBER_ID: "env.WHATSAPP_PHONE_NUMBER_ID!",
    WHATSAPP_BUSINESS_ACCOUNT_ID: "env.WHATSAPP_BUSINESS_ACCOUNT_ID!",
    WHATSAPP_ACCESS_TOKEN: "env.WHATSAPP_ACCESS_TOKEN!",
  },
}));

// Mock formatters
vi.mock("@/utils/format", () => ({
  formatDate: vi.fn().mockReturnValue("Monday, January 1, 2023"),
  formatTime: vi.fn().mockReturnValue("10:00 AM"),
  formatCurrency: vi.fn().mockReturnValue("$25.00"),
}));

describe("WhatsAppService", () => {
  let whatsAppService: WhatsAppService;

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
    phone: "+15551234567",
    userId: "user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    whatsAppService = new WhatsAppService();

    // Mock successful fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it("should send a new booking notification via WhatsApp", async () => {
    const result = await whatsAppService.sendNewBookingNotification(
      appointment,
      service,
      business,
    );

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://graph.facebook.com/v22.0/730201003504893/messages",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: expect.any(String),
      }),
    );

    // Verify the message body
    const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(requestBody).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "15551234567", // Cleaned phone number
      type: "template",
      template: {
        name: "new_booking_notification",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "John Doe" },
              { type: "text", text: "Haircut" },
              { type: "text", text: "Monday, January 1, 2023" },
              { type: "text", text: "10:00 AM" },
              {
                type: "currency",
                currency: {
                  fallback_value: "$25.00",
                  code: "USD",
                  amount_1000: 25000,
                },
              },
              { type: "text", text: "1234567890" },
              { type: "text", text: "john@example.com" },
            ],
          },
        ],
      },
    });
  });

  it("should handle API errors gracefully", async () => {
    // Mock API error
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "API Error" } }),
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await whatsAppService.sendNewBookingNotification(
      appointment,
      service,
      business,
    );

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "WhatsApp API error:",
      expect.any(Object),
    );

    consoleSpy.mockRestore();
  });

  it("should handle network errors gracefully", async () => {
    // Mock network error
    (global.fetch as any).mockRejectedValue(new Error("Network Error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await whatsAppService.sendNewBookingNotification(
      appointment,
      service,
      business,
    );

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to send WhatsApp message:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("should return false if business phone is not available", async () => {
    const businessWithoutPhone = { ...business, phone: undefined };

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await whatsAppService.sendNewBookingNotification(
      appointment,
      service,
      businessWithoutPhone,
    );

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Business phone number not available for WhatsApp notification",
    );
    expect(global.fetch).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
