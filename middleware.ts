import { NextResponse } from "next/server";
export { auth as middleware } from "@/server/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any file with an extension (e.g. .svg)
     * - api routes
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|pricing|browse|book/|.*\\..*|auth/).*)",
  ],
};
