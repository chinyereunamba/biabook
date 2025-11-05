# Geocoding Providers

BiaBook now supports multiple geocoding providers with automatic fallback functionality. This provides better reliability and cost optimization for location-based features.

## Supported Providers

### Google Places API

- **Primary use**: Address autocomplete, geocoding, reverse geocoding, timezone detection
- **Strengths**: High accuracy, comprehensive place data, excellent autocomplete
- **Considerations**: Higher cost, requires Google Cloud account
- **Configuration**: Set `GOOGLE_MAPS_API_KEY` environment variable

### LocationIQ

- **Primary use**: Alternative geocoding provider based on OpenStreetMap
- **Strengths**: Lower cost, good coverage, no vendor lock-in
- **Considerations**: Less comprehensive place data than Google
- **Configuration**: Set `LOCATIONIQ_API_KEY` environment variable

## Configuration

### Environment Variables

```bash
# Google Maps API (optional)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# LocationIQ API (optional)
LOCATIONIQ_API_KEY="your-locationiq-api-key"
```

### Provider Selection Logic

The system automatically selects providers based on available API keys:

1. **Both providers configured**: Google as primary, LocationIQ as fallback
2. **Only Google configured**: Google as primary, no fallback
3. **Only LocationIQ configured**: LocationIQ as primary, no fallback
4. **No providers configured**: Limited functionality with warnings

## API Endpoints

### Get Provider Information

```
GET /api/location/providers
```

Returns current provider configuration:

```json
{
  "success": true,
  "data": {
    "primary": "google",
    "fallback": "locationiq",
    "available": ["google", "locationiq"],
    "hasConfigured": true
  }
}
```

### Existing Endpoints

All existing location endpoints continue to work unchanged:

- `POST /api/location/geocode` - Geocode address to coordinates
- `PUT /api/location/geocode` - Reverse geocode coordinates to address
- `POST /api/location/autocomplete` - Get address suggestions
- `POST /api/location/validate` - Validate address
- `POST /api/location/place-details` - Get place details

## Fallback Behavior

When the primary provider fails, the system automatically attempts to use the fallback provider:

1. **Primary provider fails**: Log warning and try fallback
2. **Fallback succeeds**: Return result with success
3. **Fallback also fails**: Return original error from primary provider

This ensures maximum reliability while maintaining consistent error handling.

## Usage Examples

### Basic Usage (Backward Compatible)

```typescript
import { geocodingService } from "@/lib/api/geocoding-service";

// All existing code continues to work
const coordinates = await geocodingService.geocodeAddress("123 Main St");
```

### Enhanced Usage (New Features)

```typescript
import { enhancedGeocodingService } from "@/lib/api/enhanced-geocoding-service";

// Get provider information
const providerInfo = enhancedGeocodingService.getProviderInfo();
console.log(
  `Using ${providerInfo.primary} with ${providerInfo.fallback} fallback`,
);

// Use enhanced service directly
const coordinates =
  await enhancedGeocodingService.geocodeAddress("123 Main St");
```

## Testing

Run the test script to verify provider configuration:

```bash
bun run scripts/test-geocoding-providers.ts
```

This will test all configured providers and show which ones are working.

## Cost Optimization

### Recommended Setup for Different Use Cases

**High-volume production**:

- Primary: LocationIQ (lower cost)
- Fallback: Google (higher accuracy when needed)

**High-accuracy requirements**:

- Primary: Google (best accuracy)
- Fallback: LocationIQ (cost-effective backup)

**Development/testing**:

- Either provider works well
- LocationIQ has generous free tier

## Migration Guide

### From Google-only Setup

1. Add `LOCATIONIQ_API_KEY` to your environment
2. No code changes required
3. System automatically uses LocationIQ as fallback

### From Custom Implementation

1. Replace direct API calls with provider abstraction
2. Use `enhancedGeocodingService` for new features
3. Existing `geocodingService` continues to work

## Troubleshooting

### No Providers Configured

```
❌ No providers configured. Please set GOOGLE_MAPS_API_KEY or LOCATIONIQ_API_KEY
```

**Solution**: Add at least one API key to your environment variables.

### Primary Provider Failing

```
⚠️ Primary provider (google) failed: API key invalid
✅ Fallback provider (locationiq) succeeded
```

**Solution**: Check your primary provider API key and billing status.

### Both Providers Failing

```
❌ Both providers failed - check your API keys and network connection
```

**Solution**: Verify API keys, check billing status, and ensure network connectivity.

## API Key Setup

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Geocoding API
   - Places API
   - Time Zone API
3. Create API key and restrict to your domain
4. Add to environment as `GOOGLE_MAPS_API_KEY`

### LocationIQ API

1. Sign up at [LocationIQ](https://locationiq.com/)
2. Get your API key from the dashboard
3. Add to environment as `LOCATIONIQ_API_KEY`
4. Free tier includes 5,000 requests/day

## Best Practices

1. **Always configure a fallback provider** for production
2. **Monitor API usage** to optimize costs
3. **Test both providers** in your staging environment
4. **Set up alerts** for API failures
5. **Cache results** to reduce API calls (already implemented)
