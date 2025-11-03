import { db } from "@/server/db";
import { businesses, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "./index";

// Helper function to get the current user's business
export async function getCurrentUserBusiness() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Find the first business owned by this user
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, session.user.id))
    .limit(1);

  return business ?? null;
}

// Helper function to check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}

// Helper function to get current user with full details
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user ?? null;
}

// Helper function to require admin access (throws error if not admin)
export async function requireAdmin() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    throw new Error("Admin access required");
  }
}

// Helper function to get user role
export async function getCurrentUserRole(): Promise<"user" | "admin" | null> {
  const session = await auth();
  return session?.user?.role ?? null;
}
