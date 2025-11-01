import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/server/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "database",
  },
  secret: process.env.AUTH_SECRET!,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  callbacks: {
    async signIn({ account, profile }: any) {
      if (account.provider === "google") {
        return profile.email_verified && profile.email.endsWith("@example.com");
      }
      return true;
    },
  },
  debug: true,
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
});
