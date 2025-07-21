# BookMe - Simple Appointment Booking

BookMe is an appointment booking platform designed for service businesses like salons, tutors, clinics, photographers, trainers, and spas. The platform allows customers to book appointments in 60 seconds without creating accounts and provides WhatsApp notifications for business owners.

## Features

- **60-second booking**: Customers can book appointments quickly without creating accounts
- **WhatsApp notifications**: Instant notifications for business owners when bookings are made
- **Simple setup**: No complicated configuration required
- **Admin dashboard**: Manage bookings, services, and availability
- **Smart scheduling**: Automatic availability management
- **Customer management**: Track customer information and booking history
- **Business management**: Each user can manage their own business profile

## Tech Stack

- **Framework**: Next.js 15 with App Router (React 19)
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Package Manager**: Bun

## Authentication

BookMe uses NextAuth.js v5 for authentication with the following features:

- Google OAuth provider for sign-in
- Session data includes user onboarding status
- Protected routes for dashboard and admin areas
- Database adapter for persistent sessions
- Custom login page with Google sign-in button

## Project Structure

The project follows a modern Next.js App Router structure:

- **Public Routes** (`src/app/(main)/`): Landing page, business listings, booking flow
- **Protected Routes** (`src/app/(dash)/`): Dashboard, admin, settings
  - Dashboard layout with sidebar navigation and header
  - Business-specific views and data
- **API Routes** (`src/app/api/`): Server-side API endpoints
  - Business data endpoints
  - Authentication endpoints
  - Booking and service management
- **Components** (`src/components/`): Reusable UI components
  - Sidebar with navigation links
  - Dashboard header with user profile
- **Server** (`src/server/`): Authentication, database schema, repositories
- **Library** (`src/lib/`): Utility functions and shared logic
  - `get-business.ts`: Helper to fetch the current user's business

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
