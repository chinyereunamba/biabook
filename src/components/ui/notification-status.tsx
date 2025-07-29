"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Mail,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NotificationStatus {
  id: string;
  type: "whatsapp" | "email" | "sms";
  status: "pending" | "sent" | "delivered" | "failed";
  recipient: string;
  sentAt?: Date | null;
  error?: string;
  retryCount?: number;
}

interface NotificationStatusProps {
  notifications: NotificationStatus[];
  title?: string;
  className?: string;
  onRetry?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
}

export function NotificationStatusComponent({
  notifications,
  title = "Notifications",
  className = "",
  onRetry,
  onDismiss,
}: NotificationStatusProps) {
  const [visibleNotifications, setVisibleNotifications] =
    useState(notifications);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const getStatusIcon = (status: NotificationStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "sent":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: NotificationStatus["type"]) => {
    switch (type) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-600" />;
      case "sms":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: NotificationStatus["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "sent":
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: NotificationStatus["status"]) => {
    switch (status) {
      case "pending":
        return "Sending...";
      case "sent":
        return "Sent";
      case "delivered":
        return "Delivered";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const getTypeText = (type: NotificationStatus["type"]) => {
    switch (type) {
      case "whatsapp":
        return "WhatsApp";
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      default:
        return "Unknown";
    }
  };

  const handleDismiss = (notificationId: string) => {
    setVisibleNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId),
    );
    onDismiss?.(notificationId);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-blue-200 bg-blue-50", className)}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center font-semibold text-blue-800">
            <MessageSquare className="mr-2 h-5 w-5" />
            {title}
          </h3>
        </div>

        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3"
            >
              <div className="flex items-center space-x-3">
                {getTypeIcon(notification.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getTypeText(notification.type)} to{" "}
                      {notification.recipient}
                    </span>
                    <Badge className={getStatusColor(notification.status)}>
                      {getStatusIcon(notification.status)}
                      <span className="ml-1">
                        {getStatusText(notification.status)}
                      </span>
                    </Badge>
                  </div>

                  {notification.sentAt && (
                    <p className="text-xs text-gray-500">
                      {notification.sentAt.toLocaleString()}
                    </p>
                  )}

                  {notification.error && (
                    <p className="mt-1 text-xs text-red-600">
                      {notification.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {notification.status === "failed" && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(notification.id)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Retry
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(notification.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {visibleNotifications.some((n) => n.status === "pending") && (
          <div className="mt-3 text-xs text-blue-600">
            <Clock className="mr-1 inline h-3 w-3" />
            Notifications are being sent in the background...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
