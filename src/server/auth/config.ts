import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

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
if (!env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET is required");
}
if (!env.AUTH_GOOGLE_ID) {
  throw new Error("AUTH_GOOGLE_ID is required");
}
if (!env.AUTH_GOOGLE_SECRET) {
  throw new Error("AUTH_GOOGLE_SECRET is required");
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isOnboarded?: boolean;
      needsOnboarding?: boolean;
      role: "user" | "admin";
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    isOnboarded?: boolean;
    onboardedAt?: Date;
    // ...other properties
    // role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, ...message) => {
      console.error("NextAuth Error:", code, ...message);
    },
    warn: (code, ...message) => {
      console.warn("NextAuth Warning:", code, ...message);
    },
    debug: (code, ...message) => {
      if (process.env.NODE_ENV === "development") {
        console.debug("NextAuth Debug:", code, ...message);
      }
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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async signIn({ account, profile }) {
      try {
        // Allow all Google accounts to sign in
        if (account?.provider === "google") {
          return !!(profile?.email_verified && profile?.email);
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async session({ session, user }) {
      try {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .then((res) => res[0]);

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.isOnboarded = !!dbUser.isOnboarded;
          session.user.needsOnboarding = !dbUser.isOnboarded;
          session.user.role = "user"; // Set default role
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
  session: {
    strategy: "database",
  },
} satisfies NextAuthConfig;
