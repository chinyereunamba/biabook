import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/verify-request",
    "/error",
    "/browse",
    "/contact",
    "/privacy",
    "/terms",
    "/api/health",
    "/api/db-test",
    "/api/db/test",
  ];

  // Routes that allow booking without authentication
  const bookingRoutes = ["/book/", "/booking/"];

  // Check if it's a public route
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route),
    )
  ) {
    return NextResponse.next();
  }

  // Check if it's a booking route (allow without auth)
  if (bookingRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (session.user.role !== "admin") {
      // Redirect non-admin users to their dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Admin API routes protection
  if (pathname.startsWith("/api/admin")) {
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }
  }

  // Handle onboarding flow
  if (!session.user.isOnboarded) {
    // Allow access to onboarding pages
    if (pathname.startsWith("/onboarding")) {
      return NextResponse.next();
    }

    // Redirect to onboarding for all other protected routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // If user is onboarded but trying to access onboarding, redirect to dashboard
  if (session.user.isOnboarded && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
