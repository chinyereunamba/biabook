/**
 * Notification logging utility
 * Provides structured logging for notification operations
 */

interface NotificationLogContext {
  notificationId?: string;
  appointmentId?: string;
  businessId?: string;
  recipientType?: "business" | "customer";
  recipientEmail?: string;
  type?: string;
  [key: string]: any;
}

export class NotificationLogger {
  private logPrefix = "[NOTIFICATION]";

  /**
   * Log notification enqueue operation
   */
  logEnqueue(
    type: string,
    recipientType: "business" | "customer",
    recipientEmail: string,
    scheduledFor: Date,
    context?: NotificationLogContext,
  ) {
    console.log(`${this.logPrefix} ENQUEUE`, {
      type,
      recipientType,
      recipientEmail,
      scheduledFor: scheduledFor.toISOString(),
      ...context,
    });
  }

  /**
   * Log notification processing start
   */
  logProcessingStart(notificationId: string, context?: NotificationLogContext) {
    console.log(`${this.logPrefix} PROCESSING_START`, {
      notificationId,
      ...context,
    });
  }

  /**
   * Log notification processing success
   */
  logProcessingSuccess(
    notificationId: string,
    context?: NotificationLogContext,
  ) {
    console.log(`${this.logPrefix} PROCESSING_SUCCESS`, {
      notificationId,
      ...context,
    });
  }

  /**
   * Log notification processing failure
   */
  logProcessingFailure(
    notificationId: string,
    error: string,
    context?: NotificationLogContext,
  ) {
    console.error(`${this.logPrefix} PROCESSING_FAILURE`, {
      notificationId,
      error,
      ...context,
    });
  }

  /**
   * Log email sending attempt
   */
  logEmailAttempt(
    to: string,
    subject: string,
    success: boolean,
    error?: string,
    context?: NotificationLogContext,
  ) {
    const level = success ? "log" : "error";
    console[level](
      `${this.logPrefix} EMAIL_${success ? "SUCCESS" : "FAILURE"}`,
      {
        to,
        subject,
        success,
        error,
        ...context,
      },
    );
  }

  /**
   * Log WhatsApp sending attempt
   */
  logWhatsAppAttempt(
    to: string,
    success: boolean,
    error?: string,
    context?: NotificationLogContext,
  ) {
    const level = success ? "log" : "error";
    console[level](
      `${this.logPrefix} WHATSAPP_${success ? "SUCCESS" : "FAILURE"}`,
      {
        to,
        success,
        error,
        ...context,
      },
    );
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    success: boolean,
    error?: string,
    context?: NotificationLogContext,
  ) {
    const level = success ? "log" : "error";
    console[level](
      `${this.logPrefix} DB_${operation.toUpperCase()}_${success ? "SUCCESS" : "FAILURE"}`,
      {
        operation,
        success,
        error,
        ...context,
      },
    );
  }

  /**
   * Log general notification info
   */
  info(message: string, context?: NotificationLogContext) {
    console.log(`${this.logPrefix} INFO: ${message}`, context);
  }

  /**
   * Log notification warning
   */
  warn(message: string, context?: NotificationLogContext) {
    console.warn(`${this.logPrefix} WARN: ${message}`, context);
  }

  /**
   * Log notification error
   */
  error(message: string, error?: any, context?: NotificationLogContext) {
    console.error(`${this.logPrefix} ERROR: ${message}`, {
      error: error instanceof Error ? error.message : error,
      ...context,
    });
  }
}

// Create a singleton instance
export const notificationLogger = new NotificationLogger();
