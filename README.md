# BookMe - Simple Appointment Booking

BookMe is an appointment booking platform designed for service businesses like salons, tutors, clinics, photographers, trainers, and spas. The platform allows customers to book appointments in 60 seconds without creating accounts and provides WhatsApp notifications for business owners.

## Features

### ✅ Implemented Features

- **60-second booking**: Customers can book appointments quickly without creating accounts
- **Service management**: Business owners can create, edit, and manage their services
- **Availability management**: Configure weekly schedules and exception dates
- **Smart scheduling**: Real-time availability calculation with conflict prevention
- **Customer booking interface**: Intuitive booking flow with service selection and time slots
- **Booking management**: Complete booking lifecycle management (create, view, modify, cancel)
- **WhatsApp & Email notifications**: Automated notifications for bookings, confirmations, and reminders
- **Analytics dashboard**: Booking trends, revenue tracking, and service performance metrics
- **Customer self-service**: Booking lookup, cancellation, and rescheduling capabilities
- **Admin dashboard**: Comprehensive business management interface
- **Authentication**: Google OAuth integration with NextAuth.js v5

### 🚧 In Progress

- **Error handling improvements**: Enhanced error messages and recovery options
- **Comprehensive testing**: Unit and integration test coverage
- **Performance optimization**: Caching system for availability calculations
- **System monitoring**: Health checks and performance analytics

## Tech Stack

- **Framework**: Next.js 15 with App Router (React 19)
- **Language**: TypeScript for type safety
- **Database**: SQLite with Drizzle ORM and @libsql/client
- **Authentication**: NextAuth.js v5 with Google OAuth and @auth/drizzle-adapter
- **Styling**: Tailwind CSS v4 with Radix UI and shadcn/ui components
- **Icons**: Lucide React and @untitledui/icons
- **Package Manager**: Bun
- **Notifications**: Email (SMTP) and WhatsApp Business API integration
- **Development**: ESLint, Prettier, TypeScript strict mode

## Authentication

BookMe uses NextAuth.js v5 for authentication with the following features:

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

- **UI Components** (`src/components/ui/`): shadcn/ui base components
- **Application Components** (`src/components/application/`): Feature-specific components
  - `booking/` - Customer booking interface components
  - `availability/` - Schedule management components
  - `analytics/` - Dashboard and reporting components
  - `services/` - Service management components
- **Base Components** (`src/components/base/`): Custom foundational components

### Server Architecture

- **Authentication** (`src/server/auth/`): NextAuth.js configuration and helpers
- **Database** (`src/server/db/`): Drizzle schema, connection, and seed files
- **Repositories** (`src/server/repositories/`): Data access layer
- **Services** (`src/server/services/`): Business logic layer
- **Notifications** (`src/server/notifications/`): Email and WhatsApp services

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bookme.git
   cd bookme
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your credentials. Make sure to keep sensitive information like API keys and tokens secure and never commit them to version control.

4. Run database migrations:

   ```bash
   bun db:migrate
   ```

5. Start the development server:
   ```bash
   bun dev
   ```

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

### Code Quality

```bash
bun check        # Run linting and type checking
bun lint         # Run ESLint
bun lint:fix     # Fix ESLint issues
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
