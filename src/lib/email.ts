import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@/components/emails/welcome-email";
import { VerificationEmail } from "@/components/emails/verification-email";

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export interface SendWelcomeEmailParams {
  to: string;
  name?: string;
}

export interface SendVerificationEmailParams {
  to: string;
  verificationUrl: string;
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  try {
    // Render the React email component to HTML
    const emailHtml = await render(WelcomeEmail({ name, email: to }));

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"BiaBook" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: `Welcome to BiaBook, ${name || "there"}! 🎉`,
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
}: SendVerificationEmailParams) {
  try {
    // Render the React email component to HTML
    const emailHtml = await render(
      VerificationEmail({ verificationUrl, email: to }),
    );

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"BiaBook" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: "Confirm your email address - BiaBook",
      html: emailHtml,
    });

    console.log("Verification email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"BiaBook" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: subject,
      html: html,
      text: text,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
