import * as nodemailer from "nodemailer";
import { env } from "@/env";

// Types for email service
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create a transporter with environment variables
const createTransporter = () => {
  // Check if we have email configuration
  if (
    !env.EMAIL_SERVER_HOST ||
    !env.EMAIL_SERVER_PORT ||
    !env.EMAIL_SERVER_USER ||
    !env.EMAIL_SERVER_PASSWORD
  ) {
    console.warn("Email configuration is missing. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: env.EMAIL_SERVER_HOST,
    port: parseInt(env.EMAIL_SERVER_PORT),
    secure: parseInt(env.EMAIL_SERVER_PORT) === 465,
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter | null;

  constructor() {
    this.transporter = createTransporter();
  }

  // Send an email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn("Email transporter not configured. Email not sent.");
        return false;
      }

      const from = env.EMAIL_FROM ?? "noreply@biabook.example.com";

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text ?? options.html.replace(/<[^>]*>/g, ""), // Strip HTML tags for plain text
      });

      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();
