# Business Endpoints

## GET /api/businesses

Get a list of all active businesses with optional filtering.

### Query Parameters

- `category` (optional) - Filter by category ID
- `location` (optional) - Filter by location
- `search` (optional) - Search by business name
- `limit` (optional) - Number of results (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

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
        "description": "Premium hair styling and coloring services",
        "location": "Downtown Seattle",
        "phone": "+1-555-0123",
        "email": "info@bellahair.com",
        "category": {
          "id": "salon",
          "name": "Hair Salon"
        },
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

---

## GET /api/businesses/:slug

Get detailed information about a specific business.

### Parameters

- `slug` (required) - Business slug

### Response

```json
{
  "success": true,
  "data": {
    "business": {
      "id": "bus_123",
      "name": "Bella Hair Salon",
      "slug": "bella-hair-salon",
      "description": "Premium hair styling and coloring services",
      "location": "Downtown Seattle",
      "phone": "+1-555-0123",
      "email": "info@bellahair.com",
      "category": {
        "id": "salon",
        "name": "Hair Salon"
      },
      "services": [
        {
          "id": "svc_456",
          "name": "Haircut & Style",
          "description": "Professional cut and styling",
          "duration": 60,
          "price": 7500,
          "category": "styling"
        }
      ],
      "weeklyAvailability": [
        {
          "dayOfWeek": 1,
          "startTime": "09:00",
          "endTime": "17:00",
          "isAvailable": true
        }
      ]
    }
  }
}
```

### Error Responses

- `404` - Business not found
- `400` - Invalid slug format

---

## GET /api/businesses/:slug/services

Get all active services for a business.

### Parameters

- `slug` (required) - Business slug

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
        "bufferTime": 15
      },
      {
        "id": "svc_789",
        "name": "Hair Color",
        "description": "Full color treatment",
        "duration": 120,
        "price": 15000,
        "category": "coloring",
        "bufferTime": 30
      }
    ]
  }
}
```

---

## GET /api/businesses/:slug/availability

Get available time slots for booking.

### Parameters

- `slug` (required) - Business slug
- `serviceId` (required) - Service ID
- `date` (required) - Date in YYYY-MM-DD format
- `timezone` (optional) - Client timezone (default: business timezone)

### Query Parameters

```
GET /api/businesses/bella-hair-salon/availability?serviceId=svc_456&date=2025-11-01
```

### Response

```json
{
  "success": true,
  "data": {
    "date": "2025-11-01",
    "service": {
      "id": "svc_456",
      "name": "Haircut & Style",
      "duration": 60
    },
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "10:00",
        "available": true
      },
      {
        "startTime": "10:15",
        "endTime": "11:15",
        "available": true
      },
      {
        "startTime": "11:30",
        "endTime": "12:30",
        "available": false,
        "reason": "booked"
      }
    ],
    "businessHours": {
      "startTime": "09:00",
      "endTime": "17:00"
    }
  }
}
```

### Error Responses

- `404` - Business or service not found
- `400` - Invalid date format or date in the past
- `422` - Service not available on requested date
