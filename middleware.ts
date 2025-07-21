import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth();

  // Protected routes require authentication
  const protectedRoutes = ["/dashboard", "/admin"];
  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  // If trying to access protected route without being logged in
  if (isProtected && !session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but not onboarded, redirect to onboarding
  // except if they're already on the onboarding page
  if (
    session?.user &&
    !session.user.isOnboarded &&
    !req.nextUrl.pathname.startsWith("/onboarding") &&
    !req.nextUrl.pathname.startsWith("/api/") &&
    !req.nextUrl.pathname.startsWith("/auth/")
  ) {
    // If this is their first visit after login, send them to the welcome page
    const welcomeUrl = new URL("/onboarding/welcome", req.url);
    return NextResponse.redirect(welcomeUrl);
  }

  // If user is already onboarded and tries to access onboarding page, redirect to dashboard
  // But allow access to the success page
  if (
    session?.user &&
    session.user.isOnboarded &&
    req.nextUrl.pathname.startsWith("/onboarding") &&
    !req.nextUrl.pathname.startsWith("/onboarding/success")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// 👇 FORCE NODEJS RUNTIME!
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/onboarding",
    "/onboarding/welcome",
    "/onboarding/success",
  ],
  // runtime: "nodejs", // ⬅️ THIS is critical!
};
