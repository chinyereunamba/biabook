import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/server/db/schema";

// Create custom adapter to handle role assignment
const customAdapter = {
  ...DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  async createUser(user: any) {
    // Admin emails - add your admin emails here
    const adminEmails = [
      "chinyereunamba15@gmail.com",
      "admin@bookme.com",
      // Add more admin emails as needed
    ];

    // Assign role based on email
    const role = adminEmails.includes(user.email) ? "admin" : "user";

    const newUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: role as "user" | "admin",
      })
      .returning()
      .then((res) => res[0]);

    return newUser;
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "database",
  },
  secret: process.env.AUTH_SECRET!,
  adapter: customAdapter as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }: any) {
      if (account?.provider === "google") {
        if (!profile?.email_verified) {
          return false;
        }
        return true;
      }
      return true;
    },

    async session({ session, user }: any) {
      // Add role and other user data to session
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role || "user";
        session.user.isOnboarded = user.isOnboarded || false;
        session.user.needsOnboarding = !user.isOnboarded;
      }
      return session;
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
