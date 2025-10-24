# Comprehensive Error Handling System

This document describes the comprehensive error handling and monitoring system implemented for the BookMe appointment booking platform.

## Overview

The error handling system provides:

- **Comprehensive error capture** - Both client-side and server-side errors
- **User-friendly error messages** - Clear, actionable error messages with recovery suggestions
- **Automatic error reporting** - Errors are automatically reported to monitoring systems
- **Error recovery options** - Retry mechanisms and fallback actions
- **Real-time monitoring** - Error tracking and alerting for system health
- **User feedback collection** - Users can provide feedback on errors to help improve the system

## Architecture

### Client-Side Error Handling

#### Error Boundary Components

- **ErrorBoundary**: React error boundary that catches JavaScript errors in component trees
- **Enhanced error UI**: User-friendly error displays with recovery options
- **Automatic error reporting**: Errors are automatically reported to the server
- **User feedback collection**: Users can provide feedback on errors

#### Error Reporting System

- **ClientErrorReporter**: Comprehensive client-side error tracking
- **Breadcrumb tracking**: User actions and navigation for error context
- **Automatic error capture**: JavaScript errors, unhandled promises, resource loading errors
- **API error tracking**: Failed API requests with context

#### Error Recovery

- **Retry mechanisms**: Automatic and manual retry options
- **Fallback actions**: Alternative actions when errors occur
- **Navigation recovery**: Options to go home or back when errors occur

### Server-Side Error Handling

#### Error Classes

- **BookingError**: Base error class for booking operations
- **ValidationError**: Input validation errors
- **ConflictError**: Booking conflicts (double-booking, etc.)
- **BusinessUnavailableError**: Business not available for booking
- **DatabaseError**: Database operation errors
- **RateLimitError**: Rate limiting errors

#### Error Processing

- **ErrorProcessor**: Comprehensive error processing with recovery options
- **Error context**: Rich context information for debugging
- **Recovery suggestions**: User-friendly suggestions for error resolution
- **Correlation IDs**: Unique identifiers for tracking errors across systems

#### Error Monitoring

- **ErrorMonitor**: Real-time error monitoring and alerting
- **Error metrics**: Error rates, patterns, and trends
- **Alert thresholds**: Configurable thresholds for error alerts
- **Error reporting**: Comprehensive error reports for analysis

### Logging and Monitoring

#### Logging System

- **BookingLogger**: Specialized logging for booking operations
- **ErrorLogger**: Enhanced error logging with metrics
- **Structured logging**: Consistent log format with context
- **Log retention**: Automatic cleanup of old logs

#### Monitoring Dashboard

- **Error metrics**: Real-time error statistics
- **Error patterns**: Analysis of error trends and patterns
- **User impact**: Analysis of how errors affect users
- **System health**: Overall system health indicators

## Usage

### Client-Side Error Handling

#### Using Error Boundaries

```tsx
import { ErrorBoundary } from "@/components/ui/error-boundary";

function MyComponent() {
  return (
    <ErrorBoundary
      componentName="MyComponent"
      showReportButton={true}
      enableAutoReporting={true}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

#### Using Error Reporting Hook

```tsx
import { useErrorReporting } from "@/utils/client-error-reporter";

function MyComponent() {
  const { reportError, trackUserAction } = useErrorReporting();

  const handleError = (error: Error) => {
    reportError(error, {
      component: "MyComponent",
      action: "button_click",
    });
  };

  const handleUserAction = () => {
    trackUserAction("button_clicked", { buttonId: "submit" });
  };

  return <button onClick={handleUserAction}>Submit</button>;
}
```

#### Using API Error Handler

```tsx
import { useApiErrorHandler, bookingApi } from "@/utils/api-error-handler";

function BookingForm() {
  const { handleApiError, handleApiSuccess } = useApiErrorHandler();

  const handleSubmit = async (bookingData) => {
    try {
      const result = await bookingApi.createBooking(bookingData);
      handleApiSuccess("Booking created successfully!");
    } catch (error) {
      handleApiError(error, { operation: "createBooking" });
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Server-Side Error Handling

#### Using Error Handler Middleware

```typescript
import { withErrorHandler } from "@/app/api/_middleware/error-handler";
import { BookingErrors } from "@/server/errors/booking-errors";

async function myApiHandler(request: NextRequest) {
  try {
    // Your API logic here
    const result = await someOperation();
    return NextResponse.json(result);
  } catch (error) {
    // Throw structured booking errors
    throw BookingErrors.validation("Invalid input", "field", ["Suggestion"]);
  }
}

export const POST = withErrorHandler(myApiHandler);
```

#### Creating Custom Errors

```typescript
import { BookingErrors } from "@/server/errors/booking-errors";

// Validation error
throw BookingErrors.validation("Invalid phone number format", "customerPhone", [
  "Phone number must be between 10-15 digits",
  "Example: (555) 123-4567",
]);

// Booking conflict error
throw BookingErrors.conflict("Time slot is no longer available", [
  "Please refresh the page and select a different time",
  "Try selecting a nearby time slot",
]);

// Business unavailable error
throw BookingErrors.businessUnavailable("Business is closed at this time", [
  "Please select a different date or time",
  "Check the business hours and try again",
]);
```

#### Using Logging

```typescript
import { bookingLogger } from "@/server/logging/booking-logger";

// Log booking operation
bookingLogger.logBookingOperation(
  "createBooking",
  true, // success
  1500, // duration in ms
  { businessId, serviceId, userId },
);

// Log validation error
bookingLogger.logValidationError(
  "customerEmail",
  "invalid-email",
  "Invalid email format",
  { userId, businessId },
);

// Log conflict detection
bookingLogger.logConflictDetection(
  "booking_conflict",
  false, // not resolved
  { businessId, appointmentDate, startTime },
);
```

## Error Types and Recovery

### Client-Side Errors

#### JavaScript Errors

- **Automatic capture**: All JavaScript errors are automatically captured
- **Stack traces**: Full stack traces for debugging
- **Component context**: Information about which component caused the error
- **Recovery**: Error boundaries provide retry and navigation options

#### API Errors

- **Structured responses**: Consistent error format from API
- **Recovery suggestions**: User-friendly suggestions for resolution
- **Retry mechanisms**: Automatic and manual retry options
- **Fallback actions**: Alternative actions when API calls fail

#### Network Errors

- **Connectivity detection**: Detection of network connectivity issues
- **Retry with backoff**: Exponential backoff for network retries
- **Offline handling**: Graceful handling of offline scenarios

### Server-Side Errors

#### Booking Conflicts

- **Real-time detection**: Conflicts detected during booking process
- **Optimistic locking**: Prevention of race conditions
- **Alternative suggestions**: Suggest alternative time slots
- **Recovery**: Refresh availability and try again

#### Validation Errors

- **Field-specific errors**: Detailed validation error messages
- **Input suggestions**: Helpful suggestions for correct input
- **Recovery**: Fix input and retry

#### System Errors

- **Database errors**: Graceful handling of database issues
- **Rate limiting**: Protection against abuse with clear messaging
- **Service unavailable**: Handling of external service failures

## Monitoring and Alerting

### Error Metrics

- **Error rates**: Percentage of requests that result in errors
- **Error patterns**: Common error types and their frequency
- **User impact**: How many users are affected by errors
- **Performance impact**: How errors affect system performance

### Alert Thresholds

- **Error rate**: Alert when error rate exceeds threshold (default: 10%)
- **Critical errors**: Alert on critical system errors (default: 5 per 15 minutes)
- **User impact**: Alert when many users are affected
- **Performance**: Alert on performance degradation due to errors

### Dashboard

- **Real-time metrics**: Live error statistics and trends
- **Error analysis**: Detailed analysis of error patterns
- **User impact**: Analysis of how errors affect user experience
- **System health**: Overall system health indicators

## Best Practices

### Error Messages

1. **Be specific**: Provide clear, specific error messages
2. **Be helpful**: Include suggestions for resolution
3. **Be empathetic**: Use friendly, understanding language
4. **Be actionable**: Provide clear next steps

### Error Recovery

1. **Provide options**: Give users multiple recovery options
2. **Make it easy**: Make recovery actions simple and obvious
3. **Preserve context**: Don't lose user data during recovery
4. **Learn from errors**: Use error data to improve the system

### Error Reporting

1. **Include context**: Provide rich context for debugging
2. **Protect privacy**: Don't log sensitive user information
3. **Be consistent**: Use consistent error formats and codes
4. **Enable debugging**: Include enough information for debugging

### Error Prevention

1. **Validate early**: Validate input as early as possible
2. **Handle edge cases**: Consider and handle edge cases
3. **Test error scenarios**: Test error handling paths
4. **Monitor proactively**: Monitor for potential issues before they become errors

## Configuration

### Client-Side Configuration

```typescript
// Configure error reporting
clientErrorReporter.setEnabled(true);
clientErrorReporter.setUserId(userId);

// Configure error boundaries
<ErrorBoundary
  componentName="MyComponent"
  showReportButton={true}
  enableAutoReporting={true}
  maxRetries={3}
>
```

### Server-Side Configuration

```typescript
// Configure alert thresholds
errorMonitor.updateThresholds({
  errorRate: 10, // 10%
  criticalErrorCount: 5,
  timeWindow: 15, // 15 minutes
});

// Configure logging
const logger = new BookingLogger();
logger.setMaxLogs(1000);
```

## Testing Error Handling

### Unit Tests

- Test error boundary behavior
- Test error recovery mechanisms
- Test error message formatting
- Test logging functionality

### Integration Tests

- Test end-to-end error flows
- Test error reporting pipeline
- Test monitoring and alerting
- Test user experience during errors

### Error Simulation

- Simulate network failures
- Simulate database errors
- Simulate high error rates
- Test alert thresholds

## Troubleshooting

### Common Issues

1. **Errors not being reported**: Check error reporting configuration
2. **Alerts not firing**: Check alert threshold configuration
3. **Poor error messages**: Review error message guidelines
4. **High error rates**: Investigate root causes using error patterns

### Debugging

1. **Use correlation IDs**: Track errors across systems
2. **Check error context**: Review error context for clues
3. **Analyze error patterns**: Look for patterns in error data
4. **Review user feedback**: Use user feedback to understand issues

This comprehensive error handling system ensures that the BookMe platform provides a robust, user-friendly experience even when things go wrong, while providing developers with the tools they need to quickly identify and resolve issues.
