# BiaBook Admin Security Implementation

## Overview

This document outlines the comprehensive role-based access control (RBAC) system implemented to ensure only admin users can access the admin dashboard and related functionality.

## Security Layers Implemented

### 1. Middleware Protection (`middleware.ts`)

- **Server-side route protection** at the edge
- Checks authentication status before any page loads
- Redirects non-admin users attempting to access `/admin/*` routes to `/dashboard`
- Blocks API calls to `/api/admin/*` with 403 Forbidden for non-admin users
- Handles authentication redirects with callback URLs

### 2. Server-Side Page Protection

- **`requireAdmin()` utility** in `src/server/auth/helpers.ts`
- Server-side authentication check on admin pages
- Automatic redirects if user is not authenticated or not admin
- Applied to key admin pages:
  - `/admin/page.tsx` (main dashboard)
  - `/admin/users/page.tsx` (user management)

### 3. Client-Side Protection

- **Admin layout component** (`src/app/(dash)/admin/layout.tsx`)
- Double-checks user role on client-side
- Redirects non-admin users to dashboard
- Shows loading state during authentication check
- Prevents rendering of admin content for non-admin users

### 4. API Route Protection

- **Individual API route protection** in all `/api/admin/*` endpoints
- Session validation and role checking
- Returns 401 Unauthorized for unauthenticated requests
- Returns 403 Forbidden for non-admin users
- Examples:
  - `/api/admin/stats/route.ts`
  - `/api/admin/businesses/route.ts`
  - `/api/admin/users/route.ts`

### 5. Database Schema Security

- **Role-based user system** in database schema
- `users` table includes `role` field with enum: `["user", "admin"]`
- Default role is "user"
- Admin emails are configured in auth system

## Admin User Configuration

### Setting Admin Users

Admin users are configured in `src/server/auth/index.ts`:

```typescript
const adminEmails = [
  "chinyereunamba15@gmail.com",
  "admin@biabook.app",
  // Add more admin emails as needed
];
```

### Role Assignment

- Automatic role assignment during user creation
- Based on email address matching admin list
- Role is stored in database and included in session

## Security Features

### Authentication Flow

1. User attempts to access admin route
2. Middleware checks authentication and role
3. Non-admin users are redirected to dashboard
4. Unauthenticated users are redirected to login
5. Server-side pages double-check with `requireAdmin()`
6. Client-side components verify role before rendering

### API Security

1. All admin API routes check session
2. Verify user role is "admin"
3. Return appropriate HTTP status codes
4. Log security violations for monitoring

### Session Management

- NextAuth.js v5 with database sessions
- Role information included in session object
- Secure session handling with proper expiration

## Testing Security

### Security Test Utility

A comprehensive security testing utility is available in `src/lib/security-test.ts`:

```typescript
import {
  runSecurityTests,
  displaySecurityTestResults,
} from "@/lib/security-test";

// Run all security tests
const results = await runSecurityTests();
displaySecurityTestResults(results.results);
```

### Manual Testing Checklist

- [ ] Unauthenticated users cannot access `/admin`
- [ ] Non-admin users are redirected from `/admin` to `/dashboard`
- [ ] Admin API routes return 401/403 for unauthorized access
- [ ] Client-side admin components don't render for non-admin users
- [ ] Middleware properly handles route protection
- [ ] Session includes correct role information

## Security Best Practices Implemented

### Defense in Depth

- Multiple layers of protection (middleware, server-side, client-side)
- Each layer can independently block unauthorized access
- Redundant checks ensure security even if one layer fails

### Principle of Least Privilege

- Users have minimum required permissions
- Default role is "user" with limited access
- Admin role only granted to specific email addresses

### Secure by Default

- All admin routes are protected by default
- Explicit authentication required for access
- Clear separation between user and admin functionality

### Audit Trail

- Security violations are logged
- Failed access attempts are tracked
- Admin actions can be monitored

## Monitoring and Maintenance

### Regular Security Checks

1. Review admin email list regularly
2. Monitor failed access attempts
3. Audit admin user activities
4. Update security measures as needed

### Adding New Admin Routes

When adding new admin routes:

1. Add server-side protection with `requireAdmin()`
2. Ensure middleware covers the route pattern
3. Add API protection if applicable
4. Test with security test utility

### Removing Admin Access

To remove admin access:

1. Remove email from admin list in auth config
2. User role will remain "admin" in database until next login
3. Consider adding role update mechanism if immediate revocation needed

## Security Considerations

### Known Limitations

- Role changes require user to log out and back in
- Admin email list is in code (consider moving to environment variables)
- No fine-grained permissions (only admin/user roles)

### Future Enhancements

- Implement permission-based access control
- Add admin user management interface
- Implement session invalidation for role changes
- Add audit logging for admin actions
- Consider implementing time-based admin sessions

## Emergency Procedures

### If Admin Access is Lost

1. Add your email to admin list in `src/server/auth/index.ts`
2. Redeploy application
3. Log out and log back in to get admin role

### If Security Breach is Suspected

1. Check server logs for unauthorized access attempts
2. Review admin user list for unauthorized additions
3. Force logout all sessions if necessary
4. Update admin email list and redeploy

## Conclusion

The implemented security system provides comprehensive protection for admin functionality through multiple layers of authentication and authorization checks. The system follows security best practices and provides tools for testing and monitoring security measures.
