/**
 * TypeScript interfaces for the appointment booking system
 * Based on the design document specifications
 */

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  duration: number; // minutes
  price: number; // cents
  isActive: boolean;
  category: string | null;
  bufferTime: number | null; // minutes between bookings
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  version?: number;
  appointmentDate: Date | string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  confirmationNumber: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface WeeklyAvailability {
  id: string;
  businessId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface AvailabilityException {
  id: string;
  businessId: string;
  date: string; // YYYY-MM-DD format
  startTime: string | null; // HH:MM format, null if closed all day
  endTime: string | null; // HH:MM format, null if closed all day
  isAvailable: boolean;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  categoryId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
}

// Extended interfaces with relations for API responses
export interface ServiceWithBusiness extends Service {
  business: Business;
}

export interface AppointmentWithDetails extends Appointment {
  business: Business;
  service: Service;
}

export interface AppointmentDetailWithDate extends Appointment {
  business: Business;
  service: Service;
}

export interface BusinessWithServices extends Business {
  services: Service[];
  category: Category;
}

// Input types for creating/updating records
export interface CreateServiceInput {
  businessId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  bufferTime?: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
  category?: string;
  bufferTime?: number;
}

export interface CreateAppointmentInput {
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  appointmentDate?: Date | undefined | string;
  startTime?: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string | null;
  version?: number;
}

export interface CreateWeeklyAvailabilityInput {
  businessId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export interface UpdateWeeklyAvailabilityInput {
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
}

export interface CreateAvailabilityExceptionInput {
  businessId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  reason?: string;
}

export interface UpdateAvailabilityExceptionInput {
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  reason?: string;
}

// Time slot interface for booking availability
export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
  duration: number; // minutes
}

// Booking availability response
export interface AvailabilityResponse {
  date: string;
  timeSlots: TimeSlot[];
}

// Analytics interfaces
export interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number; // in cents
  averageBookingValue: number; // in cents
}

export interface ServicePerformance {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  revenue: number; // in cents
  averageRating?: number;
}

export interface BusinessAnalytics {
  today: BookingStats;
  thisWeek: BookingStats;
  thisMonth: BookingStats;
  topServices: ServicePerformance[];
  repeatCustomers: number;
}
