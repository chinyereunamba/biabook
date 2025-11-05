import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

/**
 * Server-side utility to ensure user is authenticated and has admin role
 * Redirects to appropriate page if not authorized
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Server-side utility to ensure user is authenticated
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Server-side utility to check if user is admin without redirecting
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

/**
 * Server-side utility to get current session without redirecting
 */
export async function getCurrentSession() {
  return await auth();
}
