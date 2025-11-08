# BiaBook - Simple Appointment Booking

BiaBook is an appointment booking platform designed for service businesses like salons, tutors, clinics, photographers, trainers, and spas. The platform allows customers to book appointments in 60 seconds without creating accounts and provides WhatsApp notifications for business owners.

## Features

### ✅ Core Booking System

- **60-second booking**: Streamlined booking flow requiring only name, phone, and email
- **Real-time availability**: Smart scheduling with automatic conflict prevention and optimistic locking
- **Service selection**: Browse services with pricing, duration, and descriptions
- **Time slot booking**: Interactive calendar with available appointment slots
- **Booking confirmation**: Instant confirmation with unique booking reference numbers

### ✅ Business Management

- **Service management**: Create, edit, delete, and organize services with pricing and duration
- **Availability configuration**: Set weekly schedules and manage exception dates
- **Booking dashboard**: View, manage, and update all appointments with filtering and search
- **Customer management**: Track customer information and booking history
- **Analytics & reporting**: Revenue tracking, booking trends, and service performance metrics

### ✅ Customer Experience

- **No-account booking**: Book appointments without creating user accounts
- **Booking lookup**: Find bookings using confirmation number and contact details
- **Self-service management**: Cancel or reschedule appointments with time restrictions
- **Multi-channel notifications**: Receive confirmations via email and WhatsApp
- **Mobile-responsive**: Optimized booking experience across all devices

### ✅ Notification System

- **WhatsApp integration**: Instant notifications via WhatsApp Business API
- **Email notifications**: Professional email templates for confirmations and reminders
- **Automated reminders**: Scheduled notifications at 24 hours, 2 hours, and 30 minutes before appointments
- **Notification queue**: Reliable delivery with retry mechanisms and fallback options
- **Template management**: Customizable message templates for different notification types

### ✅ Technical Features

- **Authentication**: Google OAuth with NextAuth.js v5 for business owners
- **Database**: SQLite with Drizzle ORM for reliable data management
- **Error handling**: Comprehensive error display with severity levels and recovery options
- **Conflict prevention**: Advanced booking conflict detection and prevention
- **Performance optimization**: Efficient database queries and availability calculations
- **Lazy loading**: Component-level code splitting with custom loading states and intersection observer support

### 🚧 In Progress

- **Comprehensive testing**: Expanding unit and integration test coverage for core booking logic
- **Performance optimization**: Implementing caching system for availability calculations and database query optimization
- **System monitoring**: Adding health checks, performance analytics, and booking conversion tracking
- **Accessibility compliance**: Implementing ARIA attributes, keyboard navigation, and screen reader support
- **Mobile UI optimization**: Performance improvements for mobile devices including code splitting and asset optimization

### 🔧 Recent Updates

- **Lazy Loading System**: Implemented comprehensive lazy loading utilities with component-level code splitting, custom fallback states, and intersection observer support for improved mobile performance
- **Mobile-First UI Design System**: Completed comprehensive mobile-first design system implementation with responsive components, touch-friendly interfaces, and mobile-optimized layouts
- **Layout Components**: Implemented Grid, Container, Stack (VStack/HStack), BottomSheet, Drawer, and MobileTabs components with mobile-first responsive design
- **Interactive Components**: Added mobile-optimized tabs with swipe support, scrollable tab navigation, and touch-friendly interactions
- **Toast Notification System**: Enhanced toast provider with mobile-optimized positioning, error display integration, and comprehensive notification types
- **Database Configuration**: Updated LibSQL client configuration to support both local SQLite and remote Turso databases with environment-based connection handling
- **Enhanced Error Display Component**: Added comprehensive error handling with severity levels (low, medium, high, critical), retry mechanisms, expandable details, and copy-to-clipboard functionality
- **Booking Conflict Prevention**: Implemented optimistic locking and real-time availability validation
- **Notification System**: Complete email and WhatsApp notification infrastructure with scheduling and retry mechanisms
- **Analytics Dashboard**: Full business analytics with booking trends, revenue tracking, and service performance metrics
- **Testing Infrastructure**: Added Vitest for unit and integration testing with watch mode support

## Tech Stack

### Core Framework

- **Next.js 15** with App Router (React 19)
- **TypeScript** for type safety
- **Bun** as package manager and runtime

### Database & ORM

- **SQLite/LibSQL** with Drizzle ORM and @libsql/client
- **@auth/drizzle-adapter** for authentication persistence
- Supports both local SQLite (development) and remote Turso databases (production)

### Authentication & Security

- **NextAuth.js v5** (beta) with Google OAuth
- Session-based authentication with database persistence
- Protected routes and middleware

### UI & Styling

- **Tailwind CSS v4** for styling with PostCSS
- **Radix UI** components for accessible primitives
- **shadcn/ui** component library
- **Lucide React** and **@untitledui/icons** for icons
- **class-variance-authority** for component variants
- **tailwind-merge** + **clsx** for conditional classes
- **next-themes** for dark/light mode support

### Forms & Validation

- **React Hook Form** with **@hookform/resolvers**
- **Zod** for schema validation and type inference
- **@t3-oss/env-nextjs** for environment variable validation

### Data Fetching & State

- **TanStack Query** (@tanstack/react-query) for server state management
- **React Aria Components** for accessible form components

### Notifications & Email

- **Nodemailer** for SMTP email delivery
- **React Email** with **@react-email/components** for email templates
- **WhatsApp Business API** integration
- **Sonner** for toast notifications

### Charts & Analytics

- **Recharts** for data visualization and analytics charts
- **@vercel/analytics** for web analytics

### Development & Testing

- **Vitest** for unit and integration testing
- **Prettier** with Tailwind plugin for code formatting
- **TypeScript** strict mode enabled
- **Drizzle Kit** for database migrations and studio

## Authentication

BiaBook uses NextAuth.js v5 for authentication with the following features:

- Google OAuth provider for sign-in
- Session data includes user onboarding status
- Protected routes for dashboard and admin areas
- Database adapter for persistent sessions
- Custom login page with Google sign-in button

## Project Structure

The project follows a modern Next.js App Router structure with route groups:

### Route Organization

- **Public Routes** (`src/app/(main)/`): Landing page, business listings, booking flow
  - `/` - Landing page
  - `/business` - Business directory
  - `/book/[slug]` - Service booking interface
  - `/booking/[id]` - Booking management (view, cancel, reschedule)
- **Protected Routes** (`src/app/(dash)/`): Dashboard and admin areas
  - `/dashboard` - Main dashboard with analytics
  - `/dashboard/bookings` - Booking management
  - `/dashboard/services` - Service management
  - `/dashboard/availability` - Schedule configuration
  - `/dashboard/analytics` - Business analytics
  - `/admin` - Admin panel

### API Structure

- **Authentication**: `/api/auth/[...nextauth]` - NextAuth.js endpoints
- **Bookings**: `/api/bookings/*` - Booking CRUD operations
- **Services**: `/api/dashboard/services/*` - Service management
- **Availability**: `/api/availability/*` - Schedule and time slot management
- **Analytics**: `/api/businesses/[businessId]/analytics/*` - Business metrics
- **Notifications**: `/api/notifications/*` - Email and WhatsApp services

### Component Architecture

- **UI Components** (`src/components/ui/`): shadcn/ui base components with mobile-first design
  - Core components: Button, Card, Dialog, Input, Form components
  - Layout components: Grid, Container, Stack (VStack/HStack) with responsive breakpoints
  - Mobile components: BottomSheet, Drawer, MobileTabs with touch-friendly interactions
  - Interactive components: Mobile gestures, loading states, feedback components
- **Application Components** (`src/components/application/`): Feature-specific components
  - `booking/` - Customer booking interface components (calendar, time slots, forms)
  - `availability/` - Schedule management components (weekly schedule, exception dates)
  - `analytics/` - Dashboard and reporting components (charts, metrics, trends)
  - `services/` - Service management components (forms, lists, management)
- **Base Components** (`src/components/base/`): Custom foundational components
  - `error-display.tsx` - Comprehensive error handling with severity levels and retry mechanisms
  - `toast-provider.tsx` - Mobile-optimized toast notification system with positioning
  - `buttons/` - Custom button components with social login integration

### Performance & Utilities

- **Lazy Loading** (`src/lib/lazy-loading.tsx`): Comprehensive lazy loading system for optimal performance
  - `createLazyComponent()` - Utility for creating lazy-loaded components with custom fallbacks
  - `createLazyNamedComponent()` - Support for named exports in lazy-loaded modules
  - Component-specific fallbacks: `AnalyticsFallback`, `BookingFormFallback`, `ServiceManagementFallback`
  - `useIntersectionObserver()` - Hook for intersection observer based lazy loading
  - `preloadComponent()` - Utility for preloading components for better performance

### Server Architecture

- **Authentication** (`src/server/auth/`): NextAuth.js v5 configuration, helpers, and session management
- **Database** (`src/server/db/`): Drizzle schema with SQLite/LibSQL support, connection management, and seed files
  - Supports both local SQLite (development) and remote LibSQL via Turso (production)
  - Environment-based configuration with automatic auth token handling
- **Repositories** (`src/server/repositories/`): Data access layer with comprehensive CRUD operations
  - `appointment-repository.ts` - Booking management with conflict prevention
  - `availability-calculation.ts` - Smart scheduling algorithms
  - `analytics-repository.ts` - Business metrics and reporting
  - `business-repository.ts` - Business profile management
  - `service-repository.ts` - Service CRUD operations
- **Services** (`src/server/services/`): Business logic layer
  - `booking-conflict-service.ts` - Prevents double-booking with optimistic locking
- **Notifications** (`src/server/notifications/`): Multi-channel notification system
  - `email-service.ts` - SMTP email delivery with templates
  - `whatsapp-service.ts` - WhatsApp Business API integration
  - `notification-scheduler.ts` - Automated reminder scheduling
  - `notification-queue.ts` - Reliable delivery with retry mechanisms
- **Errors** (`src/server/errors/`): Structured error handling with booking-specific error types
- **Logging** (`src/server/logging/`): Comprehensive logging system for booking operations

## Implementation Status

Based on the comprehensive implementation plan, BiaBook has achieved significant progress:

### ✅ Completed (Tasks 1-8)

- **Mobile-First Design System**: Complete responsive design system with mobile-optimized components, touch-friendly interfaces, and progressive enhancement
- **Layout Components**: Grid, Container, Stack components with mobile-first breakpoints and responsive behavior
- **Mobile UI Patterns**: BottomSheet, Drawer, MobileTabs with swipe support and touch-optimized interactions
- **Interactive States**: Loading states, feedback components, micro-interactions, and smooth transitions
- **Performance Optimization**: Component-level code splitting with lazy loading utilities and intersection observer support
- **Database Schema & Core Models**: Complete database migrations and TypeScript interfaces
- **Service Management**: Full CRUD operations with UI components and API endpoints
- **Availability Management**: Weekly schedules, exception dates, and time slot calculation
- **Customer Booking Interface**: Business profiles, service selection, and time slot booking
- **Booking Management System**: Complete appointment lifecycle with conflict prevention
- **Notification System**: Email and WhatsApp integration with scheduling and retry mechanisms
- **Analytics & Reporting**: Business metrics, booking trends, and revenue tracking
- **Customer Self-Service**: Booking lookup, cancellation, and rescheduling capabilities

### 🔄 In Progress (Task 9)

- **Error Handling & Validation**: Enhanced error display component with severity levels (90% complete)
- **Robust Error Recovery**: User-friendly error messages and recovery options (in progress)
- **Logging & Monitoring**: Comprehensive logging for booking operations (in progress)

### 📋 Planned (Tasks 10-11)

- **Comprehensive Testing**: Unit tests for core booking logic and integration tests
- **Performance Optimization**: Availability caching system and database query optimization
- **System Monitoring**: Performance monitoring, health checks, and conversion tracking

The system is production-ready for core booking functionality with ongoing improvements in error handling, testing, and performance optimization.

## Database Configuration

BiaBook supports both local SQLite databases and remote LibSQL databases via Turso:

### Local Development (SQLite)

```env
DATABASE_URL="file:./db.sqlite"
DATABASE_AUTH_TOKEN=""  # Leave empty for local SQLite
```

### Production (Turso/LibSQL)

```env
DATABASE_URL="libsql://your-database-url.turso.io"
DATABASE_AUTH_TOKEN="your-turso-auth-token"
```

The database connection is configured in `src/server/db/index.ts` using the `@libsql/client` with automatic environment variable detection. The system uses Drizzle ORM for type-safe database operations and migrations.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/biabook.git
   cd biabook
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your credentials:

   ```env
   # Authentication
   AUTH_SECRET="your-auth-secret"
   AUTH_GOOGLE_ID="your-google-oauth-client-id"
   AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

   # Database
   DATABASE_URL="file:./db.sqlite"  # For local development
   # DATABASE_URL="libsql://your-turso-database-url"  # For production with Turso
   DATABASE_AUTH_TOKEN=""  # Required for Turso, leave empty for local SQLite

   # Email Service (SMTP)
   EMAIL_FROM="your-email@domain.com"
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email-username"
   EMAIL_SERVER_PASSWORD="your-app-password"

   # WhatsApp Business API
   WHATSAPP_API_URL="https://graph.facebook.com/v22.0"
   WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
   WHATSAPP_BUSINESS_ACCOUNT_ID="your-business-account-id"
   WHATSAPP_ACCESS_TOKEN="your-whatsapp-access-token"
   ```

   **Important**: Keep sensitive information like API keys and tokens secure and never commit them to version control.

4. Run database migrations:

   ```bash
   bun db:migrate
   ```

5. Start the development server:
   ```bash
   bun dev
   ```

### Troubleshooting

#### Database Connection Issues

**Local SQLite Setup:**

- Ensure `DATABASE_URL="file:./db.sqlite"` in your `.env` file
- Leave `DATABASE_AUTH_TOKEN` empty or remove it entirely
- Run `bun db:migrate` to create the database file

**Turso/LibSQL Setup:**

- Ensure your `DATABASE_URL` starts with `libsql://`
- Provide a valid `DATABASE_AUTH_TOKEN` from your Turso dashboard
- Verify your Turso database is accessible and the token has proper permissions

**Common Errors:**

- `SQLITE_CANTOPEN`: Check file permissions and path for local SQLite
- `UNAUTHORIZED`: Verify your Turso auth token is correct and not expired
- `CONNECTION_FAILED`: Check network connectivity for remote databases

## Development Commands

### Development

```bash
bun dev          # Start development server with Turbo
bun build        # Build for production
bun start        # Start production server
bun preview      # Build and start production server
```

### Database

```bash
bun db:generate  # Generate database migrations
bun db:migrate   # Run database migrations
bun db:push      # Push schema changes directly
bun db:studio    # Open Drizzle Studio
```

### Testing

```bash
bun test         # Run tests once
bun test:watch   # Run tests in watch mode
```

### Code Quality

```bash
bun check        # Run type checking
bun typecheck    # Run TypeScript compiler check
bun format:check # Check code formatting
bun format:write # Format code with Prettier
```

## Pricing Tiers

- **Starter**: Free (up to 50 bookings/month)
- **Pro**: $19/month (unlimited bookings, WhatsApp notifications)
- **Enterprise**: $49/month (multiple locations, team management, API access)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
