# Error Handling

This document describes the error handling patterns and error codes used throughout the BookMe API.

## Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context or validation errors"
    }
  },
  "timestamp": "2025-10-31T17:00:00Z"
}
```

## HTTP Status Codes

| Status Code | Description           | Usage                                    |
| ----------- | --------------------- | ---------------------------------------- |
| `200`       | OK                    | Successful request                       |
| `201`       | Created               | Resource created successfully            |
| `400`       | Bad Request           | Invalid request format or parameters     |
| `401`       | Unauthorized          | Authentication required                  |
| `403`       | Forbidden             | Insufficient permissions                 |
| `404`       | Not Found             | Resource not found                       |
| `409`       | Conflict              | Resource conflict (e.g., double booking) |
| `422`       | Unprocessable Entity  | Validation errors                        |
| `429`       | Too Many Requests     | Rate limit exceeded                      |
| `500`       | Internal Server Error | Server error                             |
| `503`       | Service Unavailable   | Temporary service outage                 |

## Error Codes

### Authentication Errors

#### `AUTH_REQUIRED`

Authentication is required to access this endpoint.

```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Authentication required"
  }
}
```

#### `INVALID_TOKEN`

The provided authentication token is invalid or expired.

```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired authentication token"
  }
}
```

#### `INSUFFICIENT_PERMISSIONS`

The authenticated user doesn't have permission to perform this action.

```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Insufficient permissions to access this resource"
  }
}
```

### Validation Errors

#### `VALIDATION_ERROR`

Request data failed validation.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "phone": "Phone number is required",
      "appointmentDate": "Date must be in the future"
    }
  }
}
```

#### `MISSING_REQUIRED_FIELD`

A required field is missing from the request.

```json
{
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Required field missing: customerName",
    "details": {
      "field": "customerName"
    }
  }
}
```

### Resource Errors

#### `RESOURCE_NOT_FOUND`

The requested resource doesn't exist.

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Business not found",
    "details": {
      "resource": "business",
      "id": "invalid-slug"
    }
  }
}
```

#### `RESOURCE_CONFLICT`

The request conflicts with the current state of the resource.

```json
{
  "error": {
    "code": "RESOURCE_CONFLICT",
    "message": "Service name already exists",
    "details": {
      "field": "name",
      "value": "Haircut & Style"
    }
  }
}
```

### Booking Errors

#### `SLOT_UNAVAILABLE`

The requested time slot is no longer available.

```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "The selected time slot is no longer available",
    "details": {
      "requestedTime": "10:00",
      "suggestedSlots": [
        {
          "startTime": "10:15",
          "endTime": "11:15"
        },
        {
          "startTime": "11:30",
          "endTime": "12:30"
        }
      ]
    }
  }
}
```

#### `BUSINESS_CLOSED`

The business is closed on the requested date.

```json
{
  "error": {
    "code": "BUSINESS_CLOSED",
    "message": "Business is closed on the selected date",
    "details": {
      "date": "2025-12-25",
      "reason": "Christmas Day"
    }
  }
}
```

#### `BOOKING_WINDOW_EXCEEDED`

The booking is outside the allowed booking window.

```json
{
  "error": {
    "code": "BOOKING_WINDOW_EXCEEDED",
    "message": "Bookings can only be made up to 90 days in advance",
    "details": {
      "maxDaysAhead": 90,
      "requestedDate": "2026-02-01"
    }
  }
}
```

#### `CANCELLATION_NOT_ALLOWED`

The booking cannot be cancelled due to business rules.

```json
{
  "error": {
    "code": "CANCELLATION_NOT_ALLOWED",
    "message": "Cannot cancel booking within 2 hours of appointment time",
    "details": {
      "appointmentTime": "2025-11-01T10:00:00Z",
      "cancellationDeadline": "2025-11-01T08:00:00Z"
    }
  }
}
```

### Rate Limiting Errors

#### `RATE_LIMIT_EXCEEDED`

Too many requests have been made within the rate limit window.

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds",
    "details": {
      "limit": 100,
      "window": "1 minute",
      "retryAfter": 60
    }
  }
}
```

#### `BOOKING_RATE_LIMIT`

Too many booking attempts from the same IP address.

```json
{
  "error": {
    "code": "BOOKING_RATE_LIMIT",
    "message": "Too many booking attempts. Please wait before trying again",
    "details": {
      "retryAfter": 300
    }
  }
}
```

### Business Logic Errors

#### `SERVICE_INACTIVE`

The requested service is not currently active.

```json
{
  "error": {
    "code": "SERVICE_INACTIVE",
    "message": "The selected service is no longer available",
    "details": {
      "serviceId": "svc_456",
      "serviceName": "Hair Color"
    }
  }
}
```

#### `INVALID_STATUS_TRANSITION`

The requested status change is not allowed.

```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot change status from 'completed' to 'pending'",
    "details": {
      "currentStatus": "completed",
      "requestedStatus": "pending",
      "allowedTransitions": ["completed"]
    }
  }
}
```

#### `OPTIMISTIC_LOCK_FAILURE`

The resource was modified by another request (version conflict).

```json
{
  "error": {
    "code": "OPTIMISTIC_LOCK_FAILURE",
    "message": "Resource was modified by another request. Please refresh and try again",
    "details": {
      "expectedVersion": 1,
      "currentVersion": 2
    }
  }
}
```

### System Errors

#### `INTERNAL_SERVER_ERROR`

An unexpected server error occurred.

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later",
    "details": {
      "requestId": "req_123456789"
    }
  }
}
```

#### `SERVICE_UNAVAILABLE`

The service is temporarily unavailable.

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable. Please try again later",
    "details": {
      "retryAfter": 300
    }
  }
}
```

#### `DATABASE_ERROR`

Database operation failed.

```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database operation failed. Please try again",
    "details": {
      "operation": "insert",
      "table": "appointments"
    }
  }
}
```

## Error Handling Best Practices

### Client-Side Error Handling

```javascript
async function createBooking(bookingData) {
  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (!result.success) {
      handleApiError(result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

function handleApiError(error) {
  switch (error.code) {
    case "SLOT_UNAVAILABLE":
      showAlternativeSlots(error.details.suggestedSlots);
      break;
    case "VALIDATION_ERROR":
      showValidationErrors(error.details);
      break;
    case "RATE_LIMIT_EXCEEDED":
      showRetryMessage(error.details.retryAfter);
      break;
    default:
      showGenericError(error.message);
  }
}
```

### Server-Side Error Responses

```javascript
// Express.js error handler
app.use((error, req, res, next) => {
  const errorResponse = {
    success: false,
    data: null,
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred",
      details: error.details || {},
    },
    timestamp: new Date().toISOString(),
  };

  // Log error for monitoring
  console.error("API Error:", {
    code: error.code,
    message: error.message,
    stack: error.stack,
    requestId: req.id,
    userId: req.user?.id,
    endpoint: `${req.method} ${req.path}`,
  });

  // Send appropriate HTTP status
  const statusCode = getHttpStatusForError(error.code);
  res.status(statusCode).json(errorResponse);
});
```

### Retry Logic

For transient errors, implement exponential backoff:

```javascript
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      const shouldRetry = isRetryableError(error.code);

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function isRetryableError(errorCode) {
  const retryableErrors = [
    "INTERNAL_SERVER_ERROR",
    "SERVICE_UNAVAILABLE",
    "DATABASE_ERROR",
  ];
  return retryableErrors.includes(errorCode);
}
```
