import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendWelcomeEmail } from "@/lib/email";
import nodemailer from "nodemailer";

// Get the mocked transport object
const mockSendMail = vi.fn();
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

// Mock react-email
vi.mock("@react-email/components", () => ({
  render: vi.fn(() => "<html>Test Email</html>"),
}));

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send welcome email successfully", async () => {
    // Arrange
    mockSendMail.mockResolvedValue({ messageId: "test-message-id" });

    // Act
    const result = await sendWelcomeEmail({
      to: "test@example.com",
      name: "Test User",
    });

    // Assert
    expect(result.success).toBe(true);
    expect(result.messageId).toBe("test-message-id");
    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringContaining("Welcome to BiaBook"),
      }),
    );
  });

  it("should handle email sending errors gracefully", async () => {
    // Arrange
    mockSendMail.mockRejectedValue(new Error("SMTP Error"));

    // Act
    const result = await sendWelcomeEmail({
      to: "test@example.com",
      name: "Test User",
    });

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("SMTP Error");
  });
});