import { describe, it, expect, vi } from "vitest";
import { sendWelcomeEmail } from "@/lib/email";

// Mock nodemailer
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({
      messageId: "test-message-id",
    }),
  })),
}));

// Mock react-email
vi.mock("@react-email/components", () => ({
  render: vi.fn(() => "<html>Test Email</html>"),
}));

describe("Email Service", () => {
  it("should send welcome email successfully", async () => {
    const result = await sendWelcomeEmail({
      to: "test@example.com",
      name: "Test User",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("test-message-id");
  });

  it("should handle email sending errors gracefully", async () => {
    // Mock nodemailer to throw an error
    const nodemailer = await import("nodemailer");
    const mockTransporter = {
      sendMail: vi.fn().mockRejectedValue(new Error("SMTP Error")),
    };
    vi.mocked(nodemailer.createTransport).mockReturnValue(
      mockTransporter as any,
    );

    const result = await sendWelcomeEmail({
      to: "test@example.com",
      name: "Test User",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("SMTP Error");
  });
});
