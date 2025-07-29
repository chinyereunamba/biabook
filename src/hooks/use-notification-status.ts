"use client";

import { useState, useEffect, useCallback } from "react";
import type { NotificationStatus } from "@/components/ui/notification-status";

interface UseNotificationStatusOptions {
  appointmentId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface NotificationStatusResponse {
  notifications: NotificationStatus[];
  success: boolean;
  error?: string;
}

export function useNotificationStatus({
  appointmentId,
  autoRefresh = false,
  refreshInterval = 5000,
}: UseNotificationStatusOptions = {}) {
  const [notifications, setNotifications] = useState<NotificationStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificationStatus = useCallback(async () => {
    if (!appointmentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/notifications/status/${appointmentId}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch notification status: ${response.statusText}`,
        );
      }

      const data: NotificationStatusResponse = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        throw new Error(data.error || "Failed to fetch notification status");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching notification status:", err);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  const retryNotification = useCallback(
    async (notificationId: string) => {
      if (!appointmentId) return;

      try {
        const response = await fetch(
          `/api/notifications/retry/${notificationId}`,
          {
            method: "POST",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to retry notification: ${response.statusText}`,
          );
        }

        // Refresh the notification status after retry
        await fetchNotificationStatus();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to retry notification";
        setError(errorMessage);
        console.error("Error retrying notification:", err);
      }
    },
    [appointmentId, fetchNotificationStatus],
  );

  const addNotification = useCallback((notification: NotificationStatus) => {
    setNotifications((prev) => {
      // Check if notification already exists
      const existingIndex = prev.findIndex((n) => n.id === notification.id);
      if (existingIndex >= 0) {
        // Update existing notification
        const updated = [...prev];
        updated[existingIndex] = notification;
        return updated;
      } else {
        // Add new notification
        return [...prev, notification];
      }
    });
  }, []);

  const updateNotificationStatus = useCallback(
    (
      notificationId: string,
      status: NotificationStatus["status"],
      error?: string,
    ) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                status,
                error,
                sentAt:
                  status === "sent" || status === "delivered"
                    ? new Date()
                    : notification.sentAt,
              }
            : notification,
        ),
      );
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !appointmentId) return;

    const interval = setInterval(() => {
      // Only refresh if there are pending notifications
      if (notifications.some((n) => n.status === "pending")) {
        void fetchNotificationStatus();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [
    autoRefresh,
    appointmentId,
    refreshInterval,
    notifications,
    fetchNotificationStatus,
  ]);

  // Initial fetch
  useEffect(() => {
    if (appointmentId) {
      void fetchNotificationStatus();
    }
  }, [appointmentId, fetchNotificationStatus]);

  return {
    notifications,
    loading,
    error,
    fetchNotificationStatus,
    retryNotification,
    addNotification,
    updateNotificationStatus,
    clearError,
  };
}
