import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "../email-service";

// Mock the env module
vi.mock("@/env", () => ({
  env: {
    EMAIL_SERVER_HOST: "smtp.example.com",
    EMAIL_SERVER_PORT: "587",
    EMAIL_SERVER_USER: "test@example.com",
    EMAIL_SERVER_PASSWORD: "password123",
    EMAIL_FROM: "noreply@bookme.example.com",
  },
}));

// Mock nodemailer
vi.mock("nodemailer", () => {
  const mockSendMail = vi
    .fn()
    .mockResolvedValue({ messageId: "test-message-id" });
  const mockTransporter = { sendMail: mockSendMail };

  return {
    createTransport: vi.fn(() => mockTransporter),
  };
});

describe("EmailService", () => {
  let emailService: EmailService;
  let nodemailerMock: any;

  beforeEach(() => {
    vi.resetAllMocks();
    nodemailerMock = vi.importActual("nodemailer");
    emailService = new EmailService();
  });

  it("should create a transporter with correct configuration", () => {
    expect(nodemailerMock.createTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: "test@example.com",
        pass: "password123",
      },
    });
  });

  it("should send an email successfully", async () => {
    const result = await emailService.sendEmail({
      to: "customer@example.com",
      subject: "Test Email",
      html: "<p>Hello World</p>",
    });

    expect(result).toBe(true);

    const mockTransporter = nodemailerMock.createTransport();
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: "noreply@bookme.example.com",
      to: "customer@example.com",
      subject: "Test Email",
      html: "<p>Hello World</p>",
      text: "Hello World",
    });
  });
});
