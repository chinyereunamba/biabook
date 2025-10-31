# Admin Endpoints

These endpoints require admin authentication and are used for platform management.

## GET /api/admin/businesses

Get all businesses with admin-level details.

### Query Parameters

- `status` (optional) - Filter by status: active, inactive, pending
- `category` (optional) - Filter by category ID
- `search` (optional) - Search by business name or owner email
- `limit` (optional) - Number of results (default: 50, max: 200)
- `offset` (optional) - Pagination offset
- `sortBy` (optional) - Sort by: createdAt, name, appointmentCount
- `sortOrder` (optional) - asc or desc (default: desc)

### Response

```json
{
  "success": true,
  "data": {
    "businesses": [
      {
        "id": "bus_123",
        "name": "Bella Hair Salon",
        "slug": "bella-hair-salon",
        "description": "Premium hair styling services",
        "location": "Downtown Seattle",
        "phone": "+1-555-0123",
        "email": "info@bellahair.com",
        "category": {
          "id": "salon",
          "name": "Hair Salon"
        },
        "owner": {
          "id": "usr_456",
          "name": "Sarah Johnson",
          "email": "sarah@bellahair.com",
          "isOnboarded": true,
          "onboardedAt": "2025-01-15T10:00:00Z"
        },
        "stats": {
          "totalAppointments": 156,
          "completedAppointments": 142,
          "cancelledAppointments": 8,
          "totalRevenue": 1420000,
          "activeServices": 5,
          "lastBooking": "2025-10-30T14:30:00Z"
        },
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-10-30T16:00:00Z"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

---

## GET /api/admin/analytics

Get platform-wide analytics and metrics.

### Query Parameters

- `period` (optional) - Time period: 7d, 30d, 90d, 1y (default: 30d)
- `startDate` (optional) - Custom start date (YYYY-MM-DD)
- `endDate` (optional) - Custom end date (YYYY-MM-DD)

### Response

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBusinesses": 45,
      "activeBusinesses": 42,
      "totalAppointments": 2847,
      "completedAppointments": 2654,
      "totalRevenue": 28470000,
      "averageBookingValue": 10725
    },
    "trends": {
      "appointmentsByDay": [
        {
          "date": "2025-10-24",
          "appointments": 23,
          "revenue": 246750
        },
        {
          "date": "2025-10-25",
          "appointments": 31,
          "revenue": 332450
        }
      ],
      "businessGrowth": [
        {
          "date": "2025-10-01",
          "newBusinesses": 2,
          "totalBusinesses": 43
        }
      ]
    },
    "categories": [
      {
        "id": "salon",
        "name": "Hair Salon",
        "businessCount": 18,
        "appointmentCount": 1245,
        "revenue": 13365000
      },
      {
        "id": "fitness",
        "name": "Fitness",
        "businessCount": 12,
        "appointmentCount": 856,
        "revenue": 8560000
      }
    ],
    "topBusinesses": [
      {
        "id": "bus_123",
        "name": "Bella Hair Salon",
        "appointmentCount": 156,
        "revenue": 1672000,
        "averageRating": 4.8
      }
    ]
  }
}
```

---

## PUT /api/admin/businesses/:id/status

Update business status (activate/deactivate).

### Parameters

- `id` (required) - Business ID

### Request Body

```json
{
  "status": "active",
  "reason": "Completed verification process"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "business": {
      "id": "bus_123",
      "status": "active",
      "statusUpdatedAt": "2025-10-31T17:30:00Z",
      "statusReason": "Completed verification process"
    }
  }
}
```

### Status Options

- `active` - Business is live and accepting bookings
- `inactive` - Business is temporarily disabled
- `suspended` - Business is suspended due to policy violation
- `pending` - Business is awaiting approval

---

## GET /api/admin/notifications

Get notification queue status and recent notifications.

### Query Parameters

- `status` (optional) - Filter by status: pending, processed, failed
- `type` (optional) - Filter by notification type
- `limit` (optional) - Number of results (default: 50)

### Response

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "not_789",
        "type": "booking_confirmation",
        "recipientType": "business",
        "recipientEmail": "info@bellahair.com",
        "status": "processed",
        "attempts": 1,
        "scheduledFor": "2025-10-31T15:30:00Z",
        "lastAttemptAt": "2025-10-31T15:30:15Z",
        "createdAt": "2025-10-31T15:30:00Z"
      }
    ],
    "summary": {
      "pending": 12,
      "processed": 2847,
      "failed": 23,
      "totalToday": 156
    }
  }
}
```

---

## POST /api/admin/notifications/retry

Retry failed notifications.

### Request Body

```json
{
  "notificationIds": ["not_789", "not_790"],
  "retryAll": false
}
```

### Response

```json
{
  "success": true,
  "data": {
    "retriedCount": 2,
    "message": "Notifications queued for retry"
  }
}
```

---

## GET /api/admin/system/health

Get system health status and metrics.

### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-31T17:45:00Z",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 12,
        "connections": 8
      },
      "notifications": {
        "status": "healthy",
        "queueSize": 12,
        "processingRate": 45.2
      },
      "auth": {
        "status": "healthy",
        "activeSessions": 234
      }
    },
    "metrics": {
      "uptime": 2847600,
      "memoryUsage": 68.5,
      "cpuUsage": 23.1,
      "diskUsage": 45.8
    }
  }
}
```

---

## Error Codes

### Admin-Specific Error Codes

- `ADMIN_REQUIRED` - Endpoint requires admin privileges
- `BUSINESS_NOT_FOUND` - Business ID not found
- `INVALID_STATUS_TRANSITION` - Cannot change to requested status
- `NOTIFICATION_NOT_FOUND` - Notification ID not found
- `SYSTEM_MAINTENANCE` - System is in maintenance mode

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests
- `500` - Internal Server Error
