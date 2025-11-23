import { notificationQueueService } from "./notification-queue";

/**
 * Automatic notification cleanup service
 * Deletes old processed and failed notifications to keep database clean
 */
class NotificationCleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Start the automatic cleanup service
   * @param intervalHours - How often to run cleanup (default: 24 hours)
   * @param retentionDays - How many days to keep notifications (default: 15 days)
   */
  start(intervalHours = 24, retentionDays = 15): void {
    if (this.intervalId) {
      console.warn("Notification cleanup service is already running");
      return;
    }

    console.log(
      `Starting notification cleanup service (every ${intervalHours} hours, retention: ${retentionDays} days)`,
    );

    // Run cleanup immediately on start
    void this.runCleanup(retentionDays);

    // Schedule periodic cleanup
    this.intervalId = setInterval(
      async () => {
        await this.runCleanup(retentionDays);
      },
      intervalHours * 60 * 60 * 1000,
    );

    this.isRunning = true;
  }

  /**
   * Stop the cleanup service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log("Notification cleanup service stopped");
    }
  }

  /**
   * Run cleanup once
   */
  private async runCleanup(retentionDays: number): Promise<void> {
    try {
      console.log(
        `\n[Cleanup] Running notification cleanup (retention: ${retentionDays} days)`,
      );

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      console.log(
        `[Cleanup] Deleting notifications older than: ${cutoffDate.toISOString()}`,
      );

      // Run cleanup
      const deletedCount =
        await notificationQueueService.cleanupOldNotifications(cutoffDate);

      if (deletedCount > 0) {
        console.log(`[Cleanup] ✅ Deleted ${deletedCount} old notification(s)`);
      } else {
        console.log(`[Cleanup] ✅ No old notifications to delete`);
      }
    } catch (error) {
      console.error("[Cleanup] ❌ Error during notification cleanup:", error);
    }
  }

  /**
   * Manually trigger cleanup (for testing or manual runs)
   */
  async manualCleanup(retentionDays = 15): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(
      `[Cleanup] Manual cleanup triggered (retention: ${retentionDays} days)`,
    );
    const deletedCount =
      await notificationQueueService.cleanupOldNotifications(cutoffDate);

    console.log(`[Cleanup] Deleted ${deletedCount} notification(s)`);
    return deletedCount;
  }

  /**
   * Get service status
   */
  getStatus(): { running: boolean } {
    return {
      running: this.isRunning,
    };
  }
}

// Create singleton instance
export const notificationCleanupService = new NotificationCleanupService();

// Auto-start in production (only on server-side, not during build)
if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PHASE // Don't run during Next.js build phase
) {
  // Run cleanup once per day, keep notifications for 15 days
  notificationCleanupService.start(24, 15);
}

// Auto-start in development with longer interval
if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "development" &&
  !process.env.NEXT_PHASE // Don't run during Next.js build phase
) {
  // Run cleanup once per day in dev too, keep for 15 days
  notificationCleanupService.start(24, 15);
}
