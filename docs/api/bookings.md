# Booking Endpoints

## POST /api/bookings

Create a new appointment booking. This is the core endpoint for the 60-second booking experience.

### Request Body

```json
{
  "businessSlug": "bella-hair-salon",
  "serviceId": "svc_456",
  "appointmentDate": "2025-11-01",
  "startTime": "10:00",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0199"
  },
  "notes": "First time customer, prefer shorter style"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "apt_789",
      "confirmationNumber": "BK7X9M2P",
      "business": {
        "name": "Bella Hair Salon",
        "phone": "+1-555-0123",
        "location": "Downtown Seattle"
      },
      "service": {
        "name": "Haircut & Style",
        "duration": 60,
        "price": 7500
      },
      "appointmentDate": "2025-11-01",
      "startTime": "10:00",
      "endTime": "11:00",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0199"
      },
      "status": "pending",
      "notes": "First time customer, prefer shorter style",
      "createdAt": "2025-10-31T15:30:00Z"
    }
  }
}
```

### Validation Rules

- `businessSlug`: Required, must exist and be active
- `serviceId`: Required, must belong to the business and be active
- `appointmentDate`: Required, must be today or future date, max 90 days ahead
- `startTime`: Required, must be available slot in HH:MM format
- `customer.name`: Required, 2-50 characters
- `customer.email`: Required, valid email format
- `customer.phone`: Required, valid phone format
- `notes`: Optional, max 500 characters

### Error Responses

- `400` - Validation errors
- `404` - Business or service not found
- `409` - Time slot no longer available
- `422` - Business closed on selected date
- `429` - Too many booking attempts

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "The selected time slot is no longer available",
    "details": {
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

---

## GET /api/bookings/:confirmationNumber

Get booking details by confirmation number. Public endpoint for customers to check their booking.

### Parameters

- `confirmationNumber` (required) - 8-character confirmation code

### Response

```json
{
  "success": true,
  "data": {
    "appointment": {
      "confirmationNumber": "BK7X9M2P",
      "business": {
        "name": "Bella Hair Salon",
        "phone": "+1-555-0123",
        "location": "Downtown Seattle",
        "email": "info@bellahair.com"
      },
      "service": {
        "name": "Haircut & Style",
        "duration": 60,
        "price": 7500
      },
      "appointmentDate": "2025-11-01",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "confirmed",
      "notes": "First time customer, prefer shorter style",
      "createdAt": "2025-10-31T15:30:00Z"
    }
  }
}
```

### Error Responses

- `404` - Booking not found
- `400` - Invalid confirmation number format

---

## PUT /api/bookings/:confirmationNumber/cancel

Cancel a booking. Available to customers within 24 hours of booking creation.

### Parameters

- `confirmationNumber` (required) - 8-character confirmation code

### Request Body

```json
{
  "reason": "Schedule conflict"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "appointment": {
      "confirmationNumber": "BK7X9M2P",
      "status": "cancelled",
      "cancelledAt": "2025-10-31T16:00:00Z",
      "cancellationReason": "Schedule conflict"
    }
  }
}
```

### Business Rules

- Can only cancel bookings in "pending" or "confirmed" status
- Cannot cancel within 2 hours of appointment time
- Customers can cancel within 24 hours of booking
- After 24 hours, must contact business directly

### Error Responses

- `404` - Booking not found
- `400` - Cannot cancel (too close to appointment time)
- `409` - Booking already cancelled or completed
