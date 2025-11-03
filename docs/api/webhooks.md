# Webhooks

BiaBook supports webhooks to notify external systems about important events in real-time.

## Overview

Webhooks are HTTP POST requests sent to your specified endpoint URL when certain events occur. This allows you to integrate BiaBook with your existing systems, CRM, or custom applications.

## Configuration

Webhooks can be configured in the business dashboard under Settings > Integrations > Webhooks.

### Webhook Settings

- **Endpoint URL**: Your HTTPS endpoint that will receive webhook events
- **Secret Key**: Used to verify webhook authenticity (recommended)
- **Events**: Select which events to receive
- **Retry Policy**: Configure retry attempts for failed deliveries

## Security

### Signature Verification

Each webhook includes a signature header for verification:

```
X-BiaBook-Signature: sha256=<signature>
```

Verify the signature using your secret key:

```javascript
const crypto = require("crypto");

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");

  return `sha256=${expectedSignature}` === signature;
}
```

### IP Allowlist

Webhook requests come from these IP ranges:

- `192.168.1.0/24` (development)
- `10.0.0.0/8` (production)

## Event Types

### Booking Events

#### `booking.created`

Triggered when a new booking is created.

```json
{
  "event": "booking.created",
  "timestamp": "2025-10-31T15:30:00Z",
  "data": {
    "appointment": {
      "id": "apt_789",
      "confirmationNumber": "BK7X9M2P",
      "business": {
        "id": "bus_123",
        "name": "Bella Hair Salon",
        "slug": "bella-hair-salon"
      },
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
      "status": "pending",
      "notes": "First time customer",
      "createdAt": "2025-10-31T15:30:00Z"
    }
  }
}
```

#### `booking.confirmed`

Triggered when a booking is confirmed by the business.

```json
{
  "event": "booking.confirmed",
  "timestamp": "2025-10-31T16:00:00Z",
  "data": {
    "appointment": {
      "id": "apt_789",
      "confirmationNumber": "BK7X9M2P",
      "status": "confirmed",
      "confirmedAt": "2025-10-31T16:00:00Z"
    }
  }
}
```

#### `booking.cancelled`

Triggered when a booking is cancelled.

```json
{
  "event": "booking.cancelled",
  "timestamp": "2025-10-31T16:30:00Z",
  "data": {
    "appointment": {
      "id": "apt_789",
      "confirmationNumber": "BK7X9M2P",
      "status": "cancelled",
      "cancelledAt": "2025-10-31T16:30:00Z",
      "cancellationReason": "Customer request",
      "cancelledBy": "customer"
    }
  }
}
```

#### `booking.completed`

Triggered when a booking is marked as completed.

```json
{
  "event": "booking.completed",
  "timestamp": "2025-11-01T11:00:00Z",
  "data": {
    "appointment": {
      "id": "apt_789",
      "confirmationNumber": "BK7X9M2P",
      "status": "completed",
      "completedAt": "2025-11-01T11:00:00Z"
    }
  }
}
```

### Business Events

#### `business.created`

Triggered when a new business is created.

```json
{
  "event": "business.created",
  "timestamp": "2025-10-31T10:00:00Z",
  "data": {
    "business": {
      "id": "bus_123",
      "name": "Bella Hair Salon",
      "slug": "bella-hair-salon",
      "category": "salon",
      "owner": {
        "id": "usr_456",
        "email": "sarah@bellahair.com"
      },
      "createdAt": "2025-10-31T10:00:00Z"
    }
  }
}
```

#### `business.updated`

Triggered when business details are updated.

```json
{
  "event": "business.updated",
  "timestamp": "2025-10-31T14:00:00Z",
  "data": {
    "business": {
      "id": "bus_123",
      "updatedFields": ["name", "description"],
      "updatedAt": "2025-10-31T14:00:00Z"
    }
  }
}
```

### Service Events

#### `service.created`

Triggered when a new service is added.

```json
{
  "event": "service.created",
  "timestamp": "2025-10-31T12:00:00Z",
  "data": {
    "service": {
      "id": "svc_789",
      "businessId": "bus_123",
      "name": "Hair Color",
      "duration": 120,
      "price": 15000,
      "createdAt": "2025-10-31T12:00:00Z"
    }
  }
}
```

#### `service.updated`

Triggered when a service is modified.

```json
{
  "event": "service.updated",
  "timestamp": "2025-10-31T13:00:00Z",
  "data": {
    "service": {
      "id": "svc_789",
      "businessId": "bus_123",
      "updatedFields": ["price", "description"],
      "updatedAt": "2025-10-31T13:00:00Z"
    }
  }
}
```

## Delivery and Retries

### Delivery Expectations

- Webhooks are delivered within 30 seconds of the event
- Timeout: 30 seconds
- Expected response: HTTP 2xx status code
- Content-Type: `application/json`

### Retry Policy

Failed webhook deliveries are retried with exponential backoff:

1. Immediate retry
2. 1 minute later
3. 5 minutes later
4. 15 minutes later
5. 1 hour later
6. 6 hours later
7. 24 hours later

After 7 failed attempts, the webhook is marked as failed and no further retries are attempted.

### Failure Reasons

- HTTP status code >= 400
- Connection timeout (30 seconds)
- DNS resolution failure
- SSL certificate errors

## Testing Webhooks

### Webhook Testing Tool

Use the webhook testing tool in your dashboard to:

- Send test events to your endpoint
- View delivery logs and responses
- Debug webhook issues

### Example Test Event

```bash
curl -X POST https://your-endpoint.com/webhooks \
  -H "Content-Type: application/json" \
  -H "X-BiaBook-Signature: sha256=test_signature" \
  -d '{
    "event": "booking.created",
    "timestamp": "2025-10-31T15:30:00Z",
    "data": {
      "appointment": {
        "id": "apt_test",
        "confirmationNumber": "TEST123",
        "status": "pending"
      }
    }
  }'
```

## Best Practices

### Endpoint Implementation

1. **Respond quickly**: Return HTTP 200 within 30 seconds
2. **Process asynchronously**: Queue webhook processing for complex operations
3. **Verify signatures**: Always verify webhook authenticity
4. **Handle duplicates**: Implement idempotency using event IDs
5. **Log events**: Keep logs for debugging and audit purposes

### Error Handling

```javascript
app.post("/webhooks/biabook", (req, res) => {
  try {
    // Verify signature
    if (!verifyWebhook(req.body, req.headers["x-biabook-signature"], secret)) {
      return res.status(401).send("Invalid signature");
    }

    // Process webhook asynchronously
    processWebhookAsync(req.body);

    // Respond immediately
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Internal error");
  }
});
```

### Monitoring

- Monitor webhook delivery success rates
- Set up alerts for high failure rates
- Track processing times and errors
- Implement health checks for your webhook endpoint
