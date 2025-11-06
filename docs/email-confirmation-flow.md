# Email Confirmation Flow

This document describes the email confirmation and welcome email functionality implemented for BiaBook.

## Features Implemented

### 1. Confirmation Email on Credentials Signup

When a user signs up with email/password credentials:

1. **User Registration**: User submits registration form with name, email, and password
2. **Account Creation**: User account is created with `emailVerified: null`
3. **Verification Email**: A confirmation email is sent with a verification link
4. **Email Verification**: User clicks the link to verify their email address
5. **Welcome Email**: After verification, a welcome email is automatically sent
6. **Login Access**: User can now sign in with their credentials

**API Endpoints:**

- `POST /api/auth/register` - Creates user and sends verification email
- `GET /api/auth/verify-email` - Verifies email and sends welcome email

### 2. Welcome Email When Admin Sets needsOnboarding to False

When an admin updates a user's onboarding status:

1. **Admin Action**: Admin sets `isOnboarded: true` for a user via admin panel
2. **Welcome Email**: If the user wasn't previously onboarded, a welcome email is sent
3. **Onboarding Complete**: User's `onboardedAt` timestamp is set

**API Endpoint:**

- `PATCH /api/admin/users/[userId]` - Updates user status and sends welcome email

## Email Templates

### Verification Email

- **Subject**: "Confirm your email address - BiaBook"
- **Content**: Welcome message with verification button/link
- **Expiration**: Links are valid for 24 hours (recommended)

### Welcome Email

- **Subject**: "Welcome to BiaBook, [Name]!"
- **Content**: Welcome message with platform features and getting started link
- **Triggers**:
  - After email verification (credentials users)
  - When admin sets needsOnboarding to false
  - OAuth users (immediate, as they're pre-verified)

## Environment Variables

Add to your `.env` file:

```bash
# Application Base URL (required for email links)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Email Service Configuration
EMAIL_FROM="noreply@biabook.example.com"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-smtp-username"
EMAIL_SERVER_PASSWORD="your-smtp-password"
```

## Testing

### Test Email Endpoints

```bash
# Test welcome email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "type": "welcome"}'

# Test verification email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "type": "verification"}'
```

### Manual Testing Flow

1. **Credentials Signup**:
   - Go to `/signup`
   - Fill out registration form
   - Check email for verification link
   - Click verification link
   - Check email for welcome message
   - Try logging in

2. **Admin User Management**:
   - Login as admin
   - Go to admin users panel
   - Find a user with `needsOnboarding: true`
   - Set `isOnboarded: true`
   - Check that welcome email is sent

## Security Considerations

1. **Email Verification**: Credentials users cannot sign in until email is verified
2. **Token Security**: Verification tokens are user IDs (consider using JWT for production)
3. **Link Expiration**: Implement token expiration for security (recommended: 24 hours)
4. **Rate Limiting**: Consider adding rate limiting to prevent email spam

## Error Handling

- Email sending failures don't block user registration or updates
- Graceful fallbacks when email service is unavailable
- Proper error logging for debugging
- User-friendly error messages

## Future Enhancements

1. **Token Expiration**: Implement proper token expiration and cleanup
2. **Resend Verification**: Add endpoint to resend verification emails
3. **Email Templates**: Enhanced HTML templates with better styling
4. **Email Preferences**: Allow users to manage email notification preferences
5. **Email Analytics**: Track email open rates and click-through rates
