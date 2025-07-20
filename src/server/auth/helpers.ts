import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
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
