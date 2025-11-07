import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@/components/emails/welcome-email";
import { VerificationEmail } from "@/components/emails/verification-email";
import { emailVerificationEmail } from "@/server/notifications/email-templates";

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
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

export interface SendPasswordResetEmailParams {
  to: string;
  name?: string;
  resetToken: string;
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
    // Use both React email component and HTML template as fallback
    let emailHtml: string;

    try {
      // Try to render the React email component first
      emailHtml = await render(
        VerificationEmail({ verificationUrl, email: to }),
      );
    } catch (renderError) {
      console.warn(
        "Failed to render React email component, using HTML template:",
        renderError,
      );
      // Fallback to HTML template
      emailHtml = emailVerificationEmail("", to, verificationUrl);
    }

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"BiaBook" <${process.env.EMAIL_FROM}>`,
      sender: process.env.EMAIL_SERVER_USER,
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

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: SendPasswordResetEmailParams) {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - BiaBook</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #7c3aed, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
            .warning { background: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BiaBook</div>
            </div>
            
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hi ${name || "there"},</p>
              <p>We received a request to reset your password for your BiaBook account. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
            </div>
            
            <div class="footer">
              <p>This email was sent by BiaBook. If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} BiaBook. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"BiaBook" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: "Reset Your Password - BiaBook",
      html: emailHtml,
      sender: process.env.EMAIL_SERVER_USER,
    });

    console.log("Password reset email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
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
