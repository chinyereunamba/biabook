# Dashboard Endpoints

These endpoints require authentication and are used by business owners to manage their bookings and services.

## GET /api/dashboard/appointments

Get appointments for the authenticated business owner.

### Query Parameters

- `status` (optional) - Filter by status: pending, confirmed, cancelled, completed
- `date` (optional) - Filter by specific date (YYYY-MM-DD)
- `dateFrom` (optional) - Filter from date (YYYY-MM-DD)
- `dateTo` (optional) - Filter to date (YYYY-MM-DD)
- `limit` (optional) - Number of results (default: 50, max: 200)
- `offset` (optional) - Pagination offset

### Response

```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "apt_789",
        "confirmationNumber": "BK7X9M2P",
        "service": {
          "id": "svc_456",
          "name": "Haircut & Style",
          "duration": 60,
          "price": 7500
        },
        "customer": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1-555-0199"
        },
        "appointmentDate": "2025-11-01",
        "startTime": "10:00",
        "endTime": "11:00",
        "status": "confirmed",
        "notes": "First time customer",
        "createdAt": "2025-10-31T15:30:00Z",
        "updatedAt": "2025-10-31T16:00:00Z"
      }
    ],
    "total": 1,
    "hasMore": false,
    "summary": {
      "pending": 5,
      "confirmed": 12,
      "completed": 8,
      "cancelled": 2
    }
  }
}
```

---

## PATCH /api/bookings/:id

Update a booking status or details.

### Parameters

- `id` (required) - Appointment ID

### Request Body

```json
{
  "status": "confirmed",
  "notes": "Customer confirmed via phone",
  "version": 1
}
```

### Response

```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "apt_789",
      "status": "confirmed",
      "notes": "Customer confirmed via phone",
      "version": 2,
      "updatedAt": "2025-10-31T16:30:00Z"
    }
  }
}
```

### Allowed Status Transitions

- `pending` → `confirmed`, `cancelled`
- `confirmed` → `completed`, `cancelled`
- `cancelled` → No further changes
- `completed` → No further changes

### Error Responses

- `404` - Appointment not found
- `403` - Not authorized to update this appointment
- `409` - Version conflict (optimistic locking)
- `422` - Invalid status transition

---

## GET /api/dashboard/services

Get all services for the authenticated business.

### Response

```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "svc_456",
        "name": "Haircut & Style",
        "description": "Professional cut and styling",
        "duration": 60,
        "price": 7500,
        "category": "styling",
        "bufferTime": 15,
        "isActive": true,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-20T14:30:00Z"
      }
    ]
  }
}
```

---

## POST /api/dashboard/services

Create a new service.

### Request Body

```json
{
  "name": "Hair Color",
  "description": "Full color treatment with consultation",
  "duration": 120,
  "price": 15000,
  "category": "coloring",
  "bufferTime": 30
}
```

### Response

```json
{
  "success": true,
  "data": {
    "service": {
      "id": "svc_789",
      "name": "Hair Color",
      "description": "Full color treatment with consultation",
      "duration": 120,
      "price": 15000,
      "category": "coloring",
      "bufferTime": 30,
      "isActive": true,
      "createdAt": "2025-10-31T16:45:00Z"
    }
  }
}
```

### Validation Rules

- `name`: Required, 2-100 characters, unique per business
- `description`: Optional, max 500 characters
- `duration`: Required, 15-480 minutes, must be multiple of 15
- `price`: Required, positive integer in cents
- `category`: Optional, max 50 characters
- `bufferTime`: Optional, 0-60 minutes, must be multiple of 15

---

## PUT /api/dashboard/services/:id

Update an existing service.

### Parameters

- `id` (required) - Service ID

### Request Body

```json
{
  "name": "Premium Hair Color",
  "price": 18000,
  "description": "Premium color treatment with aftercare"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "service": {
      "id": "svc_789",
      "name": "Premium Hair Color",
      "price": 18000,
      "description": "Premium color treatment with aftercare",
      "updatedAt": "2025-10-31T17:00:00Z"
    }
  }
}
```

---

## DELETE /api/dashboard/services/:id

Soft delete a service (sets isActive to false).

### Parameters

- `id` (required) - Service ID

### Response

```json
{
  "success": true,
  "data": {
    "message": "Service deactivated successfully"
  }
}
```

### Business Rules

- Cannot delete services with future appointments
- Service is soft deleted (isActive = false) to preserve historical data
- Existing appointments remain unaffected

---

## GET /api/dashboard/availability

Get current availability settings for the business.

### Response

```json
{
  "success": true,
  "data": {
    "weeklyAvailability": [
      {
        "id": "wa_123",
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      },
      {
        "id": "wa_124",
        "dayOfWeek": 2,
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ],
    "exceptions": [
      {
        "id": "ae_456",
        "date": "2025-12-25",
        "isAvailable": false,
        "reason": "Christmas Day"
      }
    ]
  }
}
```

---

## PUT /api/dashboard/availability

Update availability settings.

### Request Body

```json
{
  "weeklyAvailability": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ],
  "exceptions": [
    {
      "date": "2025-12-25",
      "isAvailable": false,
      "reason": "Christmas Day"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "message": "Availability updated successfully",
    "affectedAppointments": 0
  }
}
```

### Validation Rules

- `dayOfWeek`: 0-6 (Sunday-Saturday)
- `startTime`/`endTime`: HH:MM format, endTime must be after startTime
- `date`: YYYY-MM-DD format, must be future date
- Cannot create conflicts with existing confirmed appointments
