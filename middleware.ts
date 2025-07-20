import { auth } from "@/server/auth"; // Fixed import path
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth();

  const protectedRoutes = ["/dashboard", "/admin"];
  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  if (isProtected && !session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 👇 FORCE NODEJS RUNTIME!
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
  // runtime: "nodejs", // ⬅️ THIS is critical!
};
