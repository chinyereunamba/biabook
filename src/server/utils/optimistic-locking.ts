/**
 * Utility functions for handling optimistic locking
 */

interface DatabaseError {
  message?: string;
  code?: string;
  errno?: number;
}

export class OptimisticLockError extends Error {
  constructor(
    message = "Resource was modified by another process. Please refresh and try again.",
  ) {
    super(message);
    this.name = "OptimisticLockError";
  }
}

export class ConflictError extends Error {
  constructor(
    message: string,
    public suggestions?: string[],
  ) {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Retry function for handling optimistic locking conflicts
 */
export async function retryWithOptimisticLocking<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 100,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Only retry on optimistic lock errors
      if (error instanceof OptimisticLockError && attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = delayMs * Math.pow(2, attempt - 1) + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Don't retry other types of errors
      throw error;
    }
  }

  throw lastError!;
}

/**
 * Check if an error is a database constraint violation (SQLite specific)
 */
export function isDatabaseConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const dbError = error as DatabaseError;
  const message = dbError.message?.toLowerCase() ?? "";

  // SQLite constraint error patterns
  return (
    message.includes("unique constraint") ??
    message.includes("constraint failed") ??
    message.includes("foreign key constraint") ??
    dbError.code === "SQLITE_CONSTRAINT" ??
    dbError.errno === 19 // SQLite constraint error code
  );
}

/**
 * Extract meaningful error message from database constraint errors
 */
export function getConstraintErrorMessage(error: unknown): string {
  if (!isDatabaseConstraintError(error)) {
    const dbError = error as DatabaseError;
    return dbError.message ?? "Unknown database error";
  }

  const dbError = error as DatabaseError;
  const message = dbError.message?.toLowerCase() ?? "";

  if (
    message.includes("unique constraint") &&
    message.includes("appointments")
  ) {
    if (message.includes("unique_active_slot")) {
      return "This time slot is already booked";
    }
    if (message.includes("confirmation_number")) {
      return "Confirmation number conflict - please try again";
    }
  }

  if (message.includes("foreign key constraint")) {
    if (message.includes("business_id")) {
      return "Business not found";
    }
    if (message.includes("service_id")) {
      return "Service not found";
    }
  }

  return "Database constraint violation - please check your data";
}

/**
 * Wrap database operations with proper error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (isDatabaseConstraintError(error)) {
      const message = getConstraintErrorMessage(error);
      throw new ConflictError(message);
    }

    // Re-throw other errors as-is
    throw error;
  }
}
