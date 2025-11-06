import { type Appointment } from "@/types/appointment";
import { type Service } from "@/types/service";
import { type Business } from "@/types/business";
import { formatDate, formatTime, formatCurrency } from "@/utils/format";
import {
  formatAppointmentTimeDisplay,
  getTimezoneAbbreviation,
  getUserTimezone,
  convertAppointmentTimezones,
} from "@/lib/timezone-utils";

// src/lib/email-templates/base.ts

export const emailHeader = () => `
  <div class="header" style="
    background-color: #7c3aed;
    padding: 24px 0;
    text-align: center;
  ">
    <img src="https://biabook.app/logo.png" alt="BiaBook Logo" width="120" style="margin-bottom: 8px;" />
    <h1 style="
      color: #ffffff;
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.5px;
    ">BiaBook</h1>
  </div>
`;

export const emailFooter = () => `
  <div class="footer" style="
    background-color: #f9fafb;
    padding: 20px;
    text-align: center;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
  ">
    <p style="margin: 0;">© ${new Date().getFullYear()} <strong>BiaBook</strong>. All rights reserved.</p>
    <p style="margin: 8px 0 0 0;">You’re receiving this email because you booked or registered on BiaBook.</p>
    <p style="margin-top: 8px;">
      <a href="https://biabook.app/privacy" style="color: #7c3aed; text-decoration: none;">Privacy Policy</a> •
      <a href="https://biabook.app/terms" style="color: #7c3aed; text-decoration: none;">Terms of Service</a>
    </p>
  </div>
`;


// Base template for all emails
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BiaBook</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }
    .content {
      padding: 24px;
    }
    .button {
      display: inline-block;
      background-color: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 20px;
    }
    .details {
      background-color: #f9fafb;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${emailHeader()}
    <div class="content">
      ${content}
    </div>
    ${emailFooter()}
  </div>
</body>
</html>
`;

// Booking confirmation email with timezone support
export const bookingConfirmationEmail = async (
  appointment: Appointment,
  service: Service,
  business: Business,
  cancellationUrl: string,
  rescheduleUrl: string,
  businessTimezone?: string,
) => {
  let timeDisplay = `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`;
  let timezoneInfo = "";

  // If business has timezone information, show timezone-aware times
  if (businessTimezone) {
    try {
      const customerTimezone = getUserTimezone();
      const appointmentDateStr =
        appointment.appointmentDate instanceof Date
          ? appointment.appointmentDate.toISOString().split("T")[0]!
          : appointment.appointmentDate;

      const conversion = await convertAppointmentTimezones(
        appointmentDateStr,
        appointment.startTime,
        businessTimezone,
        customerTimezone,
      );

      const businessTimeDisplay = formatAppointmentTimeDisplay(
        conversion.businessTime.date,
        conversion.businessTime.time,
        conversion.businessTime.timezone,
        true,
      );

      timeDisplay = businessTimeDisplay;

      // Show customer time if different
      if (Math.abs(conversion.timezoneOffset) >= 1) {
        const customerTimeDisplay = formatAppointmentTimeDisplay(
          conversion.customerTime.date,
          conversion.customerTime.time,
          conversion.customerTime.timezone,
          true,
        );

        timezoneInfo = `
          <p><strong>Your Local Time:</strong> ${customerTimeDisplay}</p>
          ${
            conversion.businessTime.date !== conversion.customerTime.date
              ? '<p style="color: #f59e0b;"><strong>Note:</strong> Due to timezone differences, this appointment is on a different date in your local time.</p>'
              : ""
          }
        `;
      }
    } catch (error) {
      console.error("Failed to convert timezone for email:", error);
      // Fallback to basic time display
      timeDisplay += ` (${getTimezoneAbbreviation(businessTimezone)})`;
    }
  }

  const content = `
    <h2>Booking Confirmation</h2>
    <p>Dear ${appointment.customerName},</p>
    <p>Your booking has been confirmed with ${business.name}.</p>
    
    <div class="details">
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
      <p><strong>Time:</strong> ${timeDisplay}</p>
      ${timezoneInfo}
      <p><strong>Price:</strong> ${formatCurrency(service.price)}</p>
      <p><strong>Location:</strong> ${business.address ?? "Address not provided"}</p>
    </div>
    
    <p>If you need to make changes to your booking, you can use the links below:</p>
    
    <p>
      <a href="${rescheduleUrl}" class="button">Reschedule</a>
      <a href="${cancellationUrl}" style="margin-left: 10px; color: #6b7280; text-decoration: underline;">Cancel</a>
    </p>
    
    <p>Thank you for booking with ${business.name}!</p>
  `;

  return baseTemplate(content);
};

// Booking cancellation email
export const bookingCancellationEmail = (
  appointment: Appointment,
  service: Service,
  business: Business,
) => {
  const content = `
    <h2>Booking Cancelled</h2>
    <p>Dear ${appointment.customerName},</p>
    <p>Your booking with ${business.name} has been cancelled.</p>
    
    <div class="details">
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
      <p><strong>Time:</strong> ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}</p>
    </div>
    
    <p>If you would like to make a new booking, please visit our website.</p>
    
    <p>Thank you for using BiaBook!</p>
  `;

  return baseTemplate(content);
};

// Booking reminder email with timezone support
export const bookingReminderEmail = async (
  appointment: Appointment,
  service: Service,
  business: Business,
  cancellationUrl: string,
  rescheduleUrl: string,
  businessTimezone?: string,
) => {
  let timeDisplay = `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}`;
  let timezoneInfo = "";

  // If business has timezone information, show timezone-aware times
  if (businessTimezone) {
    try {
      const customerTimezone = getUserTimezone();
      const appointmentDateStr =
        appointment.appointmentDate instanceof Date
          ? appointment.appointmentDate.toISOString().split("T")[0]!
          : appointment.appointmentDate;

      const conversion = await convertAppointmentTimezones(
        appointmentDateStr,
        appointment.startTime,
        businessTimezone,
        customerTimezone,
      );

      const businessTimeDisplay = formatAppointmentTimeDisplay(
        conversion.businessTime.date,
        conversion.businessTime.time,
        conversion.businessTime.timezone,
        true,
      );

      timeDisplay = businessTimeDisplay;

      // Show customer time if different
      if (Math.abs(conversion.timezoneOffset) >= 1) {
        const customerTimeDisplay = formatAppointmentTimeDisplay(
          conversion.customerTime.date,
          conversion.customerTime.time,
          conversion.customerTime.timezone,
          true,
        );

        timezoneInfo = `
          <p><strong>Your Local Time:</strong> ${customerTimeDisplay}</p>
          ${
            conversion.businessTime.date !== conversion.customerTime.date
              ? '<p style="color: #f59e0b;"><strong>Note:</strong> Due to timezone differences, this appointment is on a different date in your local time.</p>'
              : ""
          }
        `;
      }
    } catch (error) {
      console.error("Failed to convert timezone for email:", error);
      // Fallback to basic time display
      timeDisplay += ` (${getTimezoneAbbreviation(businessTimezone)})`;
    }
  }

  const content = `
    <h2>Booking Reminder</h2>
    <p>Dear ${appointment.customerName},</p>
    <p>This is a reminder of your upcoming appointment with ${business.name}.</p>
    
    <div class="details">
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
      <p><strong>Time:</strong> ${timeDisplay}</p>
      ${timezoneInfo}
      <p><strong>Location:</strong> ${business.address ?? "Address not provided"}</p>
    </div>
    
    <p>If you need to make changes to your booking, you can use the links below:</p>
    
    <p>
      <a href="${rescheduleUrl}" class="button">Reschedule</a>
      <a href="${cancellationUrl}" style="margin-left: 10px; color: #6b7280; text-decoration: underline;">Cancel</a>
    </p>
    
    <p>We look forward to seeing you!</p>
  `;

  return baseTemplate(content);
};

// Booking rescheduled email
export const bookingRescheduledEmail = (
  appointment: Appointment,
  service: Service,
  business: Business,
  cancellationUrl: string,
) => {
  const content = `
    <h2>Booking Rescheduled</h2>
    <p>Dear ${appointment.customerName},</p>
    <p>Your booking with ${business.name} has been rescheduled.</p>
    
    <div class="details">
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>New Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
      <p><strong>New Time:</strong> ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}</p>
      <p><strong>Location:</strong> ${business.address ?? "Address not provided"}</p>
    </div>
    
    <p>If you need to cancel this booking, you can use the link below:</p>
    
    <p>
      <a href="${cancellationUrl}" style="color: #6b7280; text-decoration: underline;">Cancel Booking</a>
    </p>
    
    <p>Thank you for booking with ${business?.name}!</p>
  `;

  return baseTemplate(content);
};

// Business notification email (new booking)
export const businessNewBookingEmail = (
  appointment: Appointment,
  service: Service,
  viewBookingUrl: string,
) => {
  const content = `
    <h2>New Booking</h2>
    <p>You have a new booking!</p>
    
    <div class="details">
      <p><strong>Customer:</strong> ${appointment.customerName}</p>
      <p><strong>Email:</strong> ${appointment.customerEmail}</p>
      <p><strong>Phone:</strong> ${appointment.customerPhone}</p>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
      <p><strong>Time:</strong> ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}</p>
      <p><strong>Price:</strong> ${formatCurrency(service.price)}</p>
      ${appointment?.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
    </div>
    
    <p>
      <a href="${viewBookingUrl}" class="button">View Booking</a>
    </p>
  `;

  return baseTemplate(content);
};

// Email verification confirmation email
export const emailVerificationEmail = (
  name: string,
  email: string,
  verificationUrl: string,
) => {
  const content = `
    <h2>Confirm Your Email Address</h2>
    <p>Hi ${name || "there"},</p>
    <p>Welcome to BiaBook! To complete your registration and start using your account, please confirm your email address by clicking the button below.</p>
    
    <p>
      <a href="${verificationUrl}" class="button">Confirm Email Address</a>
    </p>
    
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationUrl}</p>
    
    <p>This link will expire in 24 hours for security reasons.</p>
    
    <p>If you didn't create an account with BiaBook, you can safely ignore this email.</p>
    
    <p>Best regards,<br>The BiaBook Team</p>
  `;

  return baseTemplate(content);
};
