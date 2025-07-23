/**
 * Custom error classes for booking operations
 */

export class BookingError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly suggestions?: string[];

  constructor(
    message: string,
    code: string,
    statusCode: number = 400,
    userMessage?: string,
    suggestions?: string[],
  ) {
    super(message);
    this.name = "BookingError";
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage || message;
    this.suggestions = suggestions;
  }
}

export class ValidationError extends BookingError {
  constructor(message: string, field?: string, suggestions?: string[]) {
    super(
      message,
      "VALIDATION_ERROR",
      400,
      `Please check your input: ${message}`,
      suggestions,
    );
    this.name = "ValidationError";
  }
}

export class ConflictError extends BookingError {
  constructor(message: string, suggestions?: string[]) {
    super(
      message,
      "BOOKING_CONFLICT",
      409,
      "This time slot is no longer available. Please choose a different time.",
      suggestions,
    );
    this.name = "ConflictError";
  }
}

export class BusinessUnavailableError extends BookingError {
  constructor(message: string, suggestions?: string[]) {
    super(
      message,
      "BUSINESS_UNAVAILABLE",
      400,
      "The business is not available at this time. Please choose a different date or time.",
      suggestions,
    );
    this.name = "BusinessUnavailableError";
  }
}

export class ServiceNotFoundError extends BookingError {
  constructor(serviceId: string) {
    super(
      `Service with ID ${serviceId} not found`,
      "SERVICE_NOT_FOUND",
      404,
      "The requested service is not available. Please select a different service.",
    );
    this.name = "ServiceNotFoundError";
  }
}

export class BusinessNotFoundError extends BookingError {
  constructor(businessId: string) {
    super(
      `Business with ID ${businessId} not found`,
      "BUSINESS_NOT_FOUND",
      404,
      "The requested business could not be found.",
    );
    this.name = "BusinessNotFoundError";
  }
}

export class AppointmentNotFoundError extends BookingError {
  constructor(appointmentId: string) {
    super(
      `Appointment with ID ${appointmentId} not found`,
      "APPOINTMENT_NOT_FOUND",
      404,
      "The requested appointment could not be found.",
    );
    this.name = "AppointmentNotFoundError";
  }
}

export class OptimisticLockError extends BookingError {
  constructor() {
    super(
      "Appointment was modified by another process",
      "OPTIMISTIC_LOCK_ERROR",
      409,
      "This appointment was recently modified. Please refresh the page and try again.",
    );
    this.name = "OptimisticLockError";
  }
}

export class DatabaseError extends BookingError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      "DATABASE_ERROR",
      500,
      "A system error occurred. Please try again later.",
    );
    this.name = "DatabaseError";
    this.cause = originalError;
  }
}

export class RateLimitError extends BookingError {
  constructor(retryAfter?: number) {
    super(
      "Too many requests",
      "RATE_LIMIT_EXCEEDED",
      429,
      "You're making too many requests. Please wait a moment and try again.",
      retryAfter
        ? [`Please wait ${retryAfter} seconds before trying again`]
        : undefined,
    );
    this.name = "RateLimitError";
  }
}

/**
 * Error factory functions for common booking errors
 */
export const BookingErrors = {
  validation: (message: string, field?: string, suggestions?: string[]) =>
    new ValidationError(message, field, suggestions),

  conflict: (message: string, suggestions?: string[]) =>
    new ConflictError(message, suggestions),

  businessUnavailable: (message: string, suggestions?: string[]) =>
    new BusinessUnavailableError(message, suggestions),

  serviceNotFound: (serviceId: string) => new ServiceNotFoundError(serviceId),

  businessNotFound: (businessId: string) =>
    new BusinessNotFoundError(businessId),

  appointmentNotFound: (appointmentId: string) =>
    new AppointmentNotFoundError(appointmentId),

  optimisticLock: () => new OptimisticLockError(),

  database: (message: string, originalError?: Error) =>
    new DatabaseError(message, originalError),

  rateLimit: (retryAfter?: number) => new RateLimitError(retryAfter),

  pastAppointment: () =>
    new ValidationError(
      "Cannot book appointments in the past",
      "appointmentDate",
      ["Please select a future date and time"],
    ),

  outsideBusinessHours: (businessHours: string) =>
    new BusinessUnavailableError(
      `Appointment time is outside business hours (${businessHours})`,
      ["Please select a time within business hours"],
    ),

  invalidTimeSlot: () =>
    new ValidationError("Invalid time slot selected", "startTime", [
      "Please select a valid time slot",
    ]),

  serviceInactive: (serviceName: string) =>
    new ServiceNotFoundError(
      `Service "${serviceName}" is currently unavailable`,
    ),
};

/**
 * Utility function to determine if an error is a booking error
 */
export function isBookingError(error: any): error is BookingError {
  return error instanceof BookingError;
}

/**
 * Utility function to convert unknown errors to booking errors
 */
export function toBookingError(error: unknown): BookingError {
  if (isBookingError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific database constraint errors
    const message = error.message.toLowerCase();

    if (
      message.includes("unique constraint") &&
      message.includes("appointments")
    ) {
      return BookingErrors.conflict("This time slot is already booked");
    }

    if (message.includes("foreign key constraint")) {
      if (message.includes("business_id")) {
        return BookingErrors.businessNotFound("unknown");
      }
      if (message.includes("service_id")) {
        return BookingErrors.serviceNotFound("unknown");
      }
    }

    // Generic database error
    return BookingErrors.database(error.message, error);
  }

  // Unknown error type
  return BookingErrors.database("An unexpected error occurred");
}
