# Locations API

This document describes the API endpoints for managing business locations in BiaBook.

## Overview

The Locations API allows businesses to manage multiple physical locations. Each location includes:

- Physical address (street, city, state, ZIP, country)
- Geographic coordinates (latitude, longitude)
- Timezone information
- Service radius (optional)

## Authentication

All location endpoints require authentication. Users can only manage locations for businesses they own.

## Endpoints

### GET /api/businesses/:businessId/locations

Get all locations for a business.

#### Parameters

- `businessId` (required) - Business ID

#### Response

```json
{
  "success": true,
  "locations": [
    {
      "id": "loc_123",
      "businessId": "bus_456",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US",
      "latitude": 40.7128,
      "longitude": -74.006,
      "timezone": "America/New_York",
      "serviceRadius": 25,
      "createdAt": "2025-10-31T10:00:00Z",
      "updatedAt": "2025-10-31T10:00:00Z"
    }
  ]
}
```

#### Error Responses

- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not business owner)
- `404` - Business not found

---

### POST /api/businesses/:businessId/locations

Create a new location for a business.

#### Parameters

- `businessId` (required) - Business ID

#### Request Body

```json
{
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "US",
  "latitude": 40.7128,
  "longitude": -74.006,
  "timezone": "America/New_York",
  "serviceRadius": 25
}
```

#### Field Descriptions

| Field           | Type   | Required | Description                                  |
| --------------- | ------ | -------- | -------------------------------------------- |
| `address`       | string | Yes      | Street address                               |
| `city`          | string | Yes      | City name                                    |
| `state`         | string | Yes      | State/province code                          |
| `zipCode`       | string | Yes      | ZIP/postal code                              |
| `country`       | string | Yes      | Country code (e.g., "US")                    |
| `latitude`      | number | Yes      | Latitude coordinate (-90 to 90)              |
| `longitude`     | number | Yes      | Longitude coordinate (-180 to 180)           |
| `timezone`      | string | Yes      | IANA timezone (e.g., "America/New_York")     |
| `serviceRadius` | number | No       | Service radius in miles (null for unlimited) |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "loc_123",
    "businessId": "bus_456",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "latitude": 40.7128,
    "longitude": -74.006,
    "timezone": "America/New_York",
    "serviceRadius": 25,
    "createdAt": "2025-10-31T10:00:00Z",
    "updatedAt": "2025-10-31T10:00:00Z"
  }
}
```

#### Error Responses

- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not business owner)
- `422` - Validation error (invalid coordinates or timezone)

---

### GET /api/businesses/:businessId/locations/:locationId

Get a specific location.

#### Parameters

- `businessId` (required) - Business ID
- `locationId` (required) - Location ID

#### Response

```json
{
  "success": true,
  "data": {
    "id": "loc_123",
    "businessId": "bus_456",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "latitude": 40.7128,
    "longitude": -74.006,
    "timezone": "America/New_York",
    "serviceRadius": 25,
    "createdAt": "2025-10-31T10:00:00Z",
    "updatedAt": "2025-10-31T10:00:00Z"
  }
}
```

#### Error Responses

- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not business owner)
- `404` - Location not found

---

### PUT /api/businesses/:businessId/locations/:locationId

Update an existing location.

#### Parameters

- `businessId` (required) - Business ID
- `locationId` (required) - Location ID

#### Request Body

```json
{
  "address": "456 Oak Avenue",
  "city": "Brooklyn",
  "state": "NY",
  "zipCode": "11201",
  "country": "US",
  "latitude": 40.6782,
  "longitude": -73.9442,
  "timezone": "America/New_York",
  "serviceRadius": 30
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "loc_123",
    "businessId": "bus_456",
    "address": "456 Oak Avenue",
    "city": "Brooklyn",
    "state": "NY",
    "zipCode": "11201",
    "country": "US",
    "latitude": 40.6782,
    "longitude": -73.9442,
    "timezone": "America/New_York",
    "serviceRadius": 30,
    "createdAt": "2025-10-31T10:00:00Z",
    "updatedAt": "2025-11-01T14:30:00Z"
  }
}
```

#### Error Responses

- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not business owner)
- `404` - Location not found
- `422` - Validation error (invalid coordinates or timezone)

---

### DELETE /api/businesses/:businessId/locations/:locationId

Delete a location.

#### Parameters

- `businessId` (required) - Business ID
- `locationId` (required) - Location ID

#### Response

```json
{
  "success": true,
  "message": "Location deleted successfully"
}
```

#### Business Rules

- Cannot delete the only remaining location for a business
- Deleting a location may affect:
  - Location-specific availability schedules
  - Location-specific service assignments
  - Future bookings at that location

#### Error Responses

- `400` - Bad Request (cannot delete last location)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not business owner)
- `404` - Location not found

---

## Validation Rules

### Address Fields

- **address**: 1-200 characters
- **city**: 1-100 characters
- **state**: 2-50 characters (typically 2-letter state code)
- **zipCode**: 3-20 characters
- **country**: 2-3 characters (ISO country code)

### Coordinates

- **latitude**: -90 to 90 (decimal degrees)
- **longitude**: -180 to 180 (decimal degrees)
- Coordinates must be valid geographic points

### Timezone

- Must be a valid IANA timezone identifier
- Examples: `America/New_York`, `Europe/London`, `Asia/Tokyo`
- See [IANA Time Zone Database](https://www.iana.org/time-zones)

### Service Radius

- Optional field (null for unlimited service area)
- If provided: 1-500 miles
- Used to limit booking availability based on customer location

---

## Common Use Cases

### 1. Adding First Location During Onboarding

```javascript
// Step 1: Geocode the address
const geocodeResponse = await fetch("/api/location/geocode", {
  method: "POST",
  body: JSON.stringify({
    address: "123 Main St, New York, NY 10001, US",
  }),
});
const { coordinates } = await geocodeResponse.json();

// Step 2: Detect timezone
const timezoneResponse = await fetch("/api/timezone/detect", {
  method: "POST",
  body: JSON.stringify(coordinates),
});
const { timezone } = await timezoneResponse.json();

// Step 3: Create location
const locationResponse = await fetch(
  `/api/businesses/${businessId}/locations`,
  {
    method: "POST",
    body: JSON.stringify({
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timezone: timezone,
      serviceRadius: 25,
    }),
  },
);
```

### 2. Listing All Locations

```javascript
const response = await fetch(`/api/businesses/${businessId}/locations`);
const { locations } = await response.json();

locations.forEach((location) => {
  console.log(`${location.city}, ${location.state}`);
  console.log(`Service radius: ${location.serviceRadius || "Unlimited"} miles`);
});
```

### 3. Updating Service Radius

```javascript
const response = await fetch(
  `/api/businesses/${businessId}/locations/${locationId}`,
  {
    method: "PUT",
    body: JSON.stringify({
      ...existingLocation,
      serviceRadius: 50, // Expand to 50 miles
    }),
  },
);
```

### 4. Deleting a Location

```javascript
// Check if this is the last location
const { locations } = await fetch(
  `/api/businesses/${businessId}/locations`,
).then((r) => r.json());

if (locations.length > 1) {
  await fetch(`/api/businesses/${businessId}/locations/${locationId}`, {
    method: "DELETE",
  });
} else {
  console.error("Cannot delete the only location");
}
```

---

## Integration with Other Features

### Booking Flow

When implementing location selection in the booking flow:

1. Fetch all locations for the business
2. Display locations to customer (with distance if customer location is known)
3. Filter services by selected location (if location-specific services exist)
4. Show availability for selected location

### Availability Management

Locations can have location-specific availability:

- Different operating hours per location
- Location-specific exception dates
- Location-specific service offerings

### Analytics

Location data enables:

- Revenue by location
- Bookings by location
- Popular services by location
- Customer distribution by location

---

## Related Endpoints

### Geocoding

- `POST /api/location/geocode` - Convert address to coordinates
- `PUT /api/location/geocode` - Reverse geocode (coordinates to address)

### Timezone Detection

- `POST /api/timezone/detect` - Detect timezone from coordinates

### Address Validation

- `POST /api/location/validate` - Validate and format address
- `GET /api/location/autocomplete` - Address autocomplete suggestions

---

## Best Practices

### 1. Always Validate Addresses

Use the geocoding API to validate addresses before creating locations:

```javascript
// Validate address first
const geocodeResponse = await fetch("/api/location/geocode", {
  method: "POST",
  body: JSON.stringify({ address: fullAddress }),
});

if (!geocodeResponse.ok) {
  // Handle invalid address
  return;
}

// Then create location with validated data
```

### 2. Auto-Detect Timezone

Always detect timezone from coordinates rather than asking users:

```javascript
const timezoneResponse = await fetch("/api/timezone/detect", {
  method: "POST",
  body: JSON.stringify({ latitude, longitude }),
});
const { timezone } = await timezoneResponse.json();
```

### 3. Handle Service Radius Carefully

Consider the implications of service radius:

- `null` = Unlimited (customers anywhere can book)
- `25` = 25-mile radius (customers must be within 25 miles)
- Larger radius = More potential customers but more travel time

### 4. Preserve Location Data

When deleting locations:

- Warn users about impact on future bookings
- Consider soft-deleting instead of hard-deleting
- Preserve historical booking data

### 5. Update Coordinates When Address Changes

If address is updated, always re-geocode:

```javascript
// When address changes
const newCoordinates = await geocodeAddress(newAddress);
const newTimezone = await detectTimezone(newCoordinates);

// Update location with new coordinates and timezone
await updateLocation({
  ...location,
  address: newAddress,
  latitude: newCoordinates.latitude,
  longitude: newCoordinates.longitude,
  timezone: newTimezone,
});
```

---

## Error Handling

### Common Errors

#### Invalid Coordinates

```json
{
  "success": false,
  "error": "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180."
}
```

#### Invalid Timezone

```json
{
  "success": false,
  "error": "Invalid timezone. Must be a valid IANA timezone identifier."
}
```

#### Cannot Delete Last Location

```json
{
  "success": false,
  "error": "Cannot delete the only location. Add another location first."
}
```

#### Unauthorized Access

```json
{
  "success": false,
  "error": "Forbidden. You don't have permission to manage this business's locations."
}
```

---

## Rate Limits

Location endpoints share the standard API rate limits:

- **Authenticated requests**: 100 requests per minute
- **Location creation**: 10 locations per business per hour
- **Location updates**: 50 updates per hour

---

## Changelog

### Version 1.0.0 (November 8, 2025)

- Initial release of Locations API
- Support for multiple locations per business
- CRUD operations for locations
- Address validation and geocoding integration
- Timezone detection
- Service radius configuration

---

## Support

For questions or issues with the Locations API:

1. Check this documentation
2. Review the [Geocoding Providers](../geocoding-providers.md) documentation
3. Review the [Timezone Providers](../timezone-providers.md) documentation
4. Check the [Error Handling](./errors.md) documentation
5. Contact support with specific error messages and request details
