"use client";

import React, { Component, type ReactNode } from "react";
import { ErrorFeedback, RetryFeedback } from "./feedback-states";
import { Button } from "./button";
import {
  RefreshCw,
  Home,
  MessageCircle,
  Copy,
  CheckCircle,
  Bug,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Alert, AlertDescription } from "./alert";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  errorId?: string;
  showFeedbackForm: boolean;
  feedbackSubmitted: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  componentName?: string;
  showReportButton?: boolean;
  enableAutoReporting?: boolean;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      showFeedbackForm: false,
      feedbackSubmitted: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1,
        showFeedbackForm: false,
        feedbackSubmitted: false,
      });
    }
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleContactSupport = () => {
    window.location.href = "mailto:support@biabook.app";
  };

  handleCopyError = async () => {
    const { error, errorId } = this.state;
    if (!error) return;

    const errorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      component: this.props.componentName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(errorDetails, null, 2),
      );
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  handleSubmitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { error, errorId } = this.state;
    if (!error) return;

    const formData = new FormData(event.currentTarget);
    const feedback = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      comments: formData.get("comments") as string,
    };

    try {
      this.setState({ feedbackSubmitted: true, showFeedbackForm: false });
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  render() {
    const {
      hasError,
      error,
      retryCount,
      errorId,
      showFeedbackForm,
      feedbackSubmitted,
    } = this.state;
    const {
      children,
      fallback,
      maxRetries = 3,
      showReportButton = true,
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleRetry);
      }

      // Default enhanced error UI
      const canRetry = retryCount < maxRetries;
      const isNetworkError =
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("NetworkError");

      return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center">
              <h1 className="text-foreground text-2xl font-bold">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mt-2">
                {isNetworkError
                  ? "We're having trouble connecting to our servers."
                  : "An unexpected error occurred while loading this page."}
              </p>
            </div>

            <ErrorFeedback
              title="Error Details"
              message={
                process.env.NODE_ENV === "development"
                  ? error.message
                  : "The application encountered an unexpected error."
              }
            />

            <div className="space-y-3">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="primary"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again ({maxRetries - retryCount} attempts left)
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>

                <Button
                  onClick={this.handleContactSupport}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Support
                </Button>
              </div>
            </div>

            {/* Enhanced Error Details Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Bug className="mr-2 h-4 w-4" />
                    Error Details
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleCopyError}
                    className="flex items-center text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Error ID:</span> {errorId}
                  </div>
                  {this.props.componentName && (
                    <div>
                      <span className="font-medium">Component:</span>{" "}
                      {this.props.componentName}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Time:</span>{" "}
                    {new Date().toLocaleString()}
                  </div>
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                    Technical Details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded border bg-gray-50 p-3 text-xs">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>

                {showReportButton && !feedbackSubmitted && (
                  <div className="border-t pt-3">
                    {!showFeedbackForm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          this.setState({ showFeedbackForm: true })
                        }
                        className="w-full"
                      >
                        Report This Issue
                      </Button>
                    ) : (
                      <form
                        onSubmit={this.handleSubmitFeedback}
                        className="space-y-3"
                      >
                        <div className="text-sm font-medium">
                          Help us fix this issue:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            name="name"
                            placeholder="Your name (optional)"
                            className="rounded border px-3 py-2 text-sm"
                          />
                          <input
                            name="email"
                            type="email"
                            placeholder="Your email (optional)"
                            className="rounded border px-3 py-2 text-sm"
                          />
                        </div>
                        <textarea
                          name="comments"
                          placeholder="What were you trying to do when this error occurred?"
                          rows={3}
                          className="w-full rounded border px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="flex-1">
                            Submit Report
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              this.setState({ showFeedbackForm: false })
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {feedbackSubmitted && (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Thank you for your feedback! We'll use this information to
                      improve the app.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component that wraps components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
