# Timezone Providers

The BiaBook application now supports multiple timezone detection providers with automatic fallback functionality.

## Supported Providers

### 1. Google Timezone API (Primary)

- **Provider Name**: `google`
- **Requirements**: `GOOGLE_MAPS_API_KEY` environment variable
- **Features**: High accuracy, comprehensive coverage
- **Rate Limits**: Based on Google Maps API quotas
- **Cost**: Paid service

### 2. TimeZoneDB

- **Provider Name**: `timezonedb`
- **Requirements**: `TIMEZONEDB_API_KEY` environment variable
- **Features**: Good accuracy, reliable service
- **Rate Limits**: Based on TimeZoneDB plan
- **Cost**: Free tier available, paid plans for higher usage

### 3. WorldTimeAPI (Fallback)

- **Provider Name**: `worldtime`
- **Requirements**: None (free service)
- **Features**: Basic timezone detection, always available
- **Rate Limits**: Reasonable for fallback usage
- **Cost**: Free

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Timezone provider configuration
TIMEZONE_PROVIDER="auto"  # Options: google, timezonedb, worldtime, auto
TIMEZONEDB_API_KEY="your-timezonedb-api-key"  # Optional
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"  # Optional
```

### Provider Selection Modes

1. **Auto Mode** (Recommended): `TIMEZONE_PROVIDER="auto"`
   - Automatically selects the best available provider
   - Falls back to other providers if the primary fails
   - Order: Google → TimeZoneDB → WorldTimeAPI

2. **Specific Provider**: `TIMEZONE_PROVIDER="google"`
   - Uses only the specified provider
   - Falls back to other providers if the primary fails

## Usage

### Basic Usage (Auto-Fallback)

```typescript
import { detectTimezone } from "@/lib/timezone-service";

const coordinates = { latitude: 40.7128, longitude: -74.006 };
const timezone = await detectTimezone(coordinates);
console.log(timezone); // "America/New_York"
```

### Using Specific Provider

```typescript
import { detectTimezoneWithProvider } from "@/lib/timezone-service";

const coordinates = { latitude: 40.7128, longitude: -74.006 };
const result = await detectTimezoneWithProvider(coordinates, "google");
console.log(result.timezone); // "America/New_York"
console.log(result.provider); // "google"
```

### Check Available Providers

```typescript
import { getAvailableTimezoneProviders } from "@/lib/timezone-service";

const providers = getAvailableTimezoneProviders();
console.log(providers);
// [
//   { name: "google", available: true },
//   { name: "timezonedb", available: false },
//   { name: "worldtime", available: true }
// ]
```

## API Endpoints

### GET /api/timezone/providers

Returns the status of all timezone providers.

**Response:**

```json
{
  "success": true,
  "providers": [
    { "name": "google", "available": true },
    { "name": "timezonedb", "available": false },
    { "name": "worldtime", "available": true }
  ]
}
```

### POST /api/timezone/providers

Test timezone detection with specific coordinates and optional provider.

**Request:**

```json
{
  "coordinates": { "latitude": 40.7128, "longitude": -74.006 },
  "provider": "google" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "timezone": "America/New_York",
  "provider": "google",
  "coordinates": { "latitude": 40.7128, "longitude": -74.006 }
}
```

## Error Handling

The system provides comprehensive error handling with automatic fallback:

1. **Provider Unavailable**: Automatically tries the next available provider
2. **API Errors**: Logs errors and attempts fallback providers
3. **Invalid Responses**: Validates timezone data and retries with different providers
4. **Network Issues**: Handles timeouts and connection errors gracefully

## Testing

### Using the Test Script

```bash
bun run src/scripts/test-timezone-providers.ts
```

### Using the React Component

Import and use the `TimezoneProviderTest` component to test providers interactively:

```typescript
import { TimezoneProviderTest } from "@/components/application/timezone/timezone-provider-test";

export default function TestPage() {
  return <TimezoneProviderTest />;
}
```

## Best Practices

1. **Use Auto Mode**: Let the system choose the best available provider
2. **Configure Multiple Providers**: Set up both Google and TimeZoneDB for redundancy
3. **Monitor Usage**: Keep track of API usage to avoid rate limits
4. **Handle Errors Gracefully**: Always provide fallback options in your UI
5. **Cache Results**: Consider caching timezone results for frequently accessed locations

## Troubleshooting

### Common Issues

1. **"All timezone providers failed"**
   - Check your API keys are correctly configured
   - Verify network connectivity
   - Ensure coordinates are valid

2. **"Provider not available"**
   - Check the required environment variables are set
   - Verify API keys are valid and have sufficient quota

3. **"Invalid timezone returned"**
   - This usually indicates an issue with the provider's response
   - The system will automatically try other providers

### Debug Mode

Enable debug logging by setting the log level in your application to see which providers are being used:

```typescript
console.log(`Timezone detected using ${result.provider}: ${result.timezone}`);
```

## Migration from Single Provider

If you're migrating from the previous Google-only implementation:

1. Update your environment variables to include the new provider settings
2. The existing `detectTimezone()` function will continue to work with automatic fallback
3. No code changes required for basic usage
4. Consider adding error handling for the new provider system

## Cost Optimization

To minimize costs while maintaining reliability:

1. Use `TIMEZONE_PROVIDER="auto"` to prefer free providers when available
2. Set up TimeZoneDB as a middle-tier option
3. Keep Google as the premium option for critical applications
4. Implement caching to reduce API calls for repeated locations
