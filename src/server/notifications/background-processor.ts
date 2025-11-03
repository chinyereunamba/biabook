import { notificationScheduler } from "./notification-scheduler";

/**
 * Background notification processor
 * Processes pending notifications every minute
 */
class BackgroundNotificationProcessor {
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  /**
   * Start the background processor
   */
  start(intervalMinutes = 1): void {
    if (this.intervalId) {
      console.warn("Background notification processor is already running");
      return;
    }

    console.log(
      `Starting background notification processor (every ${intervalMinutes} minute(s))`,
    );

    this.intervalId = setInterval(
      async () => {
        await this.processNotifications();
      },
      intervalMinutes * 60 * 1000,
    );

    // Process immediately on start
    void this.processNotifications();
  }

  /**
   * Stop the background processor
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Background notification processor stopped");
    }
  }

  /**
   * Process pending notifications
   */
  private async processNotifications(): Promise<void> {
    if (this.isProcessing) {
      console.log("Notification processing already in progress, skipping...");
      return;
    }

    this.isProcessing = true;

    try {
      const processedCount =
        await notificationScheduler.processPendingNotifications(20);

      if (processedCount > 0) {
        console.log(`Processed ${processedCount} notifications`);
      }
    } catch (error) {
      console.error("Error in background notification processor:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get processor status
   */
  getStatus(): { running: boolean; processing: boolean } {
    return {
      running: this.intervalId !== null,
      processing: this.isProcessing,
    };
  }
}

// Create singleton instance
export const backgroundNotificationProcessor =
  new BackgroundNotificationProcessor();

// Auto-start in production (only on server-side, not during build)
if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PHASE // Don't run during Next.js build phase
) {
  backgroundNotificationProcessor.start(1); // Process every minute
}

// Auto-start in development with longer interval (not during build)
if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "development" &&
  !process.env.NEXT_PHASE // Don't run during Next.js build phase
) {
  backgroundNotificationProcessor.start(2); // Process every 2 minutes in dev
}
