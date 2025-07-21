import { type Appointment } from "@/types/appointment";
import { type Service } from "@/types/service";
import { type Business } from "@/types/business";
import { formatDate, formatTime, formatCurrency } from "@/utils/format";

// Base template for all emails
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BiaBook</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #7c3aed;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
      background-color: #fff;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background-color: #7c3aed;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 20px;
    }
    .details {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .details p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BiaBook</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} BiaBook. All rights reserved.</p>
      <p>This email was sent to you because you made a booking on BiaBook.</p>
    </div>
  </div>
</body>
</html>
`;

// Booking confirmation email
export const bookingConfirmationEmail = (
  appointment: Appointment,
  service: Service,
  business: Business,
  cancellationUrl: string,
  rescheduleUrl: string,
) => {
  const content = `
    <h2>Booking Confirmation</h2>
    <p>Dear ${appointment.customerName},</p>
    <p>Your booking has been confirmed with ${business.name}.</p>
    
    <div class="details">
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
      <p><strong>Time:</strong> ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}</p>
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

// Booking reminder email
export const bookingReminderEmail = (
  appointment: Appointment,
  service: Service,
  business: Business,
  cancellationUrl: string,
  rescheduleUrl: string,
) => {
  const content = `
    <h2>Booking Reminder</h2>
    <p>Dear ${appointment.customerName},</p>
    <p>This is a reminder of your upcoming appointment with ${business.name}.</p>
    
    <div class="details">
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
      <p><strong>Time:</strong> ${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}</p>
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
