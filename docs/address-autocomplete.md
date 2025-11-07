# Address Autocomplete Feature

## Overview

The address autocomplete feature has been added to the onboarding process to improve user experience when entering business addresses. It uses Google Places API to provide real-time address suggestions and automatically fills in city, state, ZIP code, and coordinates.

## Features

### 🎯 Smart Autocomplete

- Real-time address suggestions as you type
- Automatic parsing of address components (city, state, ZIP, coordinates)
- Support for business establishments and general addresses
- Country restriction (currently set to US)

### 🔒 Security & Validation

- Input sanitization to prevent XSS and injection attacks
- Rate limiting to prevent API abuse
- Comprehensive error handling with user-friendly messages
- Validation of address components

### 🚀 Performance Optimizations

- Debounced search (300ms delay) to reduce API calls
- Keyboard navigation support (arrow keys, enter, escape)
- Lazy loading of Google Maps API
- Graceful fallback when API is unavailable

### 🛡️ Error Handling

- Fallback to manual input when Google Maps API fails
- Clear error messages for users
- Retry mechanisms for transient failures
- Security monitoring and logging

## Implementation

### Components

1. **AddressAutocomplete** (`src/components/ui/address-autocomplete.tsx`)
   - Main autocomplete component with Google Places integration
   - Handles API calls, suggestions display, and user interactions

2. **AddressAutocompleteFallback** (`src/components/ui/address-autocomplete-fallback.tsx`)
   - Fallback component when Google Maps API is not available
   - Simple text input with helpful instructions

3. **useAddressAutocomplete** (`src/hooks/use-address-autocomplete.ts`)
   - React hook for managing address state and validation
   - Provides convenient methods for address manipulation

### Integration in Onboarding

The autocomplete is integrated into Step 1 of the onboarding process:

```tsx
<AddressAutocomplete
  id="address"
  value={addressState.address}
  onChange={handleAddressChange}
  onAddressSelect={handleAddressSelect}
  placeholder="Start typing your business address..."
  countryRestriction="us"
  types={["establishment", "geocode"]}
/>
```

## Configuration

### Environment Variables

Make sure to set your Google Maps API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Places API
3. Create an API key
4. Restrict the key to your domain for security
5. Add the key to your environment variables

### Rate Limiting

The system includes built-in rate limiting:

- Geocoding: 10 requests per minute per user
- General operations: 100 requests per minute per user

## Usage Examples

### Basic Usage

```tsx
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

function MyForm() {
  const [address, setAddress] = useState("");

  return (
    <AddressAutocomplete
      value={address}
      onChange={setAddress}
      onAddressSelect={(details) => {
        console.log("Selected address:", details);
        // Handle the complete address details
      }}
    />
  );
}
```

### With Hook

```tsx
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";

function MyForm() {
  const {
    addressState,
    handleAddressSelect,
    handleAddressChange,
    hasCompleteAddress,
    validationErrors,
  } = useAddressAutocomplete({
    onAddressChange: (address) => {
      console.log("Address updated:", address);
    },
  });

  return (
    <AddressAutocomplete
      value={addressState.address}
      onChange={handleAddressChange}
      onAddressSelect={handleAddressSelect}
    />
  );
}
```

## Security Features

### Input Validation

- XSS pattern detection
- SQL injection prevention
- Address format validation
- Suspicious pattern monitoring

### Rate Limiting

- Per-user request limits
- Exponential backoff for retries
- Circuit breaker pattern for API failures

### Privacy

- IP address hashing for logs
- No storage of sensitive location data
- Secure API key handling

## Error Handling

The system handles various error scenarios:

1. **API Unavailable**: Falls back to manual input
2. **Rate Limit Exceeded**: Shows user-friendly message with retry time
3. **Invalid Address**: Provides suggestions for correction
4. **Network Issues**: Automatic retry with exponential backoff
5. **Security Violations**: Logs and blocks suspicious activity

## Testing

To test the autocomplete feature:

1. Start the development server: `bun dev`
2. Navigate to `/onboarding`
3. In Step 1, start typing an address in the "Business Address" field
4. Verify that suggestions appear and selection works correctly
5. Test error scenarios by temporarily removing the API key

## Troubleshooting

### Common Issues

1. **No suggestions appearing**
   - Check if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
   - Verify the API key has Places API enabled
   - Check browser console for errors

2. **Rate limit errors**
   - Wait for the rate limit window to reset
   - Consider upgrading your Google Maps API quota

3. **Fallback mode always showing**
   - Verify the API key is correctly formatted
   - Check if the domain is allowed in API key restrictions

### Debug Mode

Enable debug logging by adding to your environment:

```env
NEXT_PUBLIC_DEBUG_LOCATION=true
```

This will log additional information about API calls and errors to the browser console.

## Future Enhancements

- [ ] Support for international addresses
- [ ] Integration with other geocoding services (fallback)
- [ ] Caching of frequently used addresses
- [ ] Bulk address validation
- [ ] Address verification with postal services
- [ ] Mobile-optimized interface improvements

## Dependencies

- Google Maps JavaScript API
- Google Places API
- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (for icons)

## Performance Metrics

The autocomplete system includes performance monitoring:

- Average response time tracking
- Error rate monitoring
- Cache hit rate analysis
- User interaction metrics

Access these metrics through the browser console in development mode.
