import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession } from "@auth/core/types";
import Google from "@auth/core/providers/google";

import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";

// Validate required environment variables
if (!env.AUTH_SECRET) throw new Error("AUTH_SECRET is required");
if (!env.AUTH_GOOGLE_ID) throw new Error("AUTH_GOOGLE_ID is required");
if (!env.AUTH_GOOGLE_SECRET) throw new Error("AUTH_GOOGLE_SECRET is required");

/**
 * Module augmentation for Auth.js types.
 */
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      isOnboarded?: boolean;
      needsOnboarding?: boolean;
      role: "user" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isOnboarded?: boolean;
    onboardedAt?: Date;
    role?: "user" | "admin";
  }
}

/**
 * Auth.js configuration
 */
export const authConfig = {
  secret: env.AUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  logger: {
    error: (code: any, ...message: any[]) =>
      console.error("Auth.js Error:", code, ...message),
    warn: (code: any, ...message: any[]) =>
      console.warn("Auth.js Warning:", code, ...message),
    debug: (code: any, ...message: any[]) => {
      if (process.env.NODE_ENV === "development")
        console.debug("Auth.js Debug:", code, ...message);
    },
  },

  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  callbacks: {
    async signIn({ account, profile }: any) {
      if (account?.provider === "google") {
        return !!(profile?.email_verified && profile?.email);
      }
      return true;
    },

    async session({ session, user }: any) {
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .then((res) => res[0]);

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.isOnboarded = !!dbUser.isOnboarded;
        session.user.needsOnboarding = !dbUser.isOnboarded;
        // Assign admin role to specific email for testing
        session.user.role =
          dbUser.email === "chinyereunamba15@gmail.com" ? "admin" : "user";

        // Log for debugging
        console.log("Session callback - User role assignment:", {
          email: dbUser.email,
          role: session.user.role,
          isAdmin: session.user.role === "admin",
          targetEmail: "chinyereunamba15@gmail.com",
          emailMatch: dbUser.email === "chinyereunamba15@gmail.com",
        });
      }

      return session;
    },
  },

  session: {
    strategy: "database",
  },
};
