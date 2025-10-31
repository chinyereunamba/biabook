# BookMe API Documentation

This documentation covers all API endpoints for the BookMe appointment booking platform.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using NextAuth.js session tokens. Include the session cookie in your requests.

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2025-10-31T12:00:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  },
  "timestamp": "2025-10-31T12:00:00Z"
}
```

## Rate Limiting

- Public endpoints: 100 requests per minute
- Authenticated endpoints: 1000 requests per minute
- Booking endpoints: 10 requests per minute per IP

## Endpoints Overview

### Public Endpoints

- [GET /businesses](#get-businesses) - List businesses
- [GET /businesses/:slug](#get-business-by-slug) - Get business details
- [GET /businesses/:slug/services](#get-business-services) - Get business services
- [GET /businesses/:slug/availability](#get-business-availability) - Get available time slots
- [POST /bookings](#create-booking) - Create appointment booking

### Authenticated Endpoints (Business Owner)

- [GET /dashboard/appointments](#get-appointments) - Get business appointments
- [PUT /appointments/:id](#update-appointment) - Update appointment
- [GET /dashboard/services](#get-services) - Get business services
- [POST /dashboard/services](#create-service) - Create service
- [PUT /dashboard/services/:id](#update-service) - Update service
- [DELETE /dashboard/services/:id](#delete-service) - Delete service
- [GET /dashboard/availability](#get-availability) - Get availability settings
- [PUT /dashboard/availability](#update-availability) - Update availability

### Admin Endpoints

- [GET /admin/businesses](#admin-get-businesses) - Get all businesses
- [GET /admin/analytics](#admin-get-analytics) - Get platform analytics

---

## Detailed Endpoint Documentation

See individual endpoint documentation:

- [Business Endpoints](./businesses.md)
- [Booking Endpoints](./bookings.md)
- [Dashboard Endpoints](./dashboard.md)
- [Admin Endpoints](./admin.md)
