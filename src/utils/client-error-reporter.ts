"use client";

/**
 * Client-side error reporting utility
 */

export interface ApiCallMetrics {
  method: string;
  url: string;
  status?: number;
  duration?: number;
  timestamp: number;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  errorCode?: string;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, unknown>;
}

class ClientErrorReporter {
  private apiCalls: ApiCallMetrics[] = [];
  private maxApiCalls = 100;

  /**
   * Track API call metrics
   */
  trackApiCall(
    method: string,
    url: string,
    status?: number,
    duration?: number,
  ): void {
    const metric: ApiCallMetrics = {
      method,
      url,
      status,
      duration,
      timestamp: Date.now(),
    };

    this.apiCalls.push(metric);

    // Keep only recent calls
    if (this.apiCalls.length > this.maxApiCalls) {
      this.apiCalls = this.apiCalls.slice(-this.maxApiCalls);
    }
  }

  /**
   * Report API error to server
   */
  async reportApiError(
    error: Error,
    apiContext: {
      method: string;
      url: string;
      status?: number;
      response?: unknown;
    },
    severity: "low" | "medium" | "high" | "critical",
  ): Promise<void> {
    try {
      const errorReport: ErrorReport = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity,
        context: {
          apiCall: apiContext,
          recentApiCalls: this.apiCalls.slice(-5),
        },
      };

      // Send to error reporting endpoint
      await fetch("/api/errors/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
    } catch (reportError) {
      // Silently fail if error reporting fails
      console.warn("Failed to report error:", reportError);
    }
  }

  /**
   * Get recent API call metrics
   */
  getRecentApiCalls(): ApiCallMetrics[] {
    return [...this.apiCalls];
  }

  /**
   * Clear API call history
   */
  clearApiCalls(): void {
    this.apiCalls = [];
  }
}

export const clientErrorReporter = new ClientErrorReporter();
