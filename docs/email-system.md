# Email System Documentation

## Overview

BiaBook now includes an automated email system that sends welcome emails to users when they sign up. The system uses React Email for templates and Nodemailer for sending emails.

## Features

- **Welcome Emails**: Automatically sent when users sign up via Google OAuth
- **React Email Templates**: Beautiful, responsive email templates
- **SMTP Configuration**: Configurable email service provider
- **Error Handling**: Graceful error handling that doesn't block user registration

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
EMAIL_FROM="no-reply@biabook.app"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### Gmail Setup

If using Gmail:

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `EMAIL_SERVER_PASSWORD`

## Components

### Email Templates (`src/components/emails/`)

- `welcome-email.tsx` - Welcome email template for new users

### Email Service (`src/lib/email.ts`)

- `sendWelcomeEmail()` - Sends welcome email to new users
- `sendEmail()` - Generic email sending function

### Authentication Integration

- Modified `src/server/auth/index.ts` to send welcome emails on user creation
- Non-blocking: Email failures don't prevent user registration

## Testing

### Test Email Endpoint

Send a POST request to `/api/test-email` with:

```json
{
  "email": "test@example.com",
  "name": "Test User"
}
```

### Unit Tests

Run email tests with:

```bash
bun test src/test/email.test.ts
```

## Email Flow

1. User signs up with Google OAuth
2. `createUser` function in auth adapter is called
3. User is created in database
4. Welcome email is sent asynchronously
5. If email fails, error is logged but user creation continues

## Customization

### Email Templates

Edit `src/components/emails/welcome-email.tsx` to customize:

- Email content and styling
- Company branding
- Call-to-action buttons

### Email Types

Add new email types by:

1. Creating new template in `src/components/emails/`
2. Adding new function in `src/lib/email.ts`
3. Calling from appropriate places in your app

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Check email credentials
   - Ensure App Password is used for Gmail
   - Verify SMTP settings

2. **Email Not Sending**
   - Check server logs for errors
   - Verify environment variables
   - Test with `/api/test-email` endpoint

3. **Template Not Rendering**
   - Check React Email component syntax
   - Verify imports in email template

### Debugging

Enable debug logging by checking server console for:

- "Welcome email sent to [email]" (success)
- "Failed to send welcome email to [email]" (failure)
