import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/server/db/schema";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";

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
      "admin@biabook.app",
      // Add more admin emails as needed
    ];

    // Assign role based on email
    const role = adminEmails.includes(user.email) ? "admin" : "user";

    const result = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: role as "user" | "admin",
      })
      .returning();

    const newUser = result[0];

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // Send welcome email to new user (only for OAuth users, not email verification users)
    if (newUser.email && newUser.emailVerified) {
      try {
        await sendWelcomeEmail({
          to: newUser.email,
          name: newUser.name || undefined,
        });
        console.log(`Welcome email sent to ${newUser.email}`);
      } catch (error) {
        console.error(
          `Failed to send welcome email to ${newUser.email}:`,
          error,
        );
        // Don't throw error here to avoid blocking user creation
      }
    }

    return newUser;
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET!,
  adapter: customAdapter as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
      async sendVerificationRequest({ identifier, url, provider }) {
        // Send verification email
        await sendVerificationEmail({
          to: identifier,
          verificationUrl: url,
        });
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }: any) {
      if (account?.provider === "google") {
        if (!profile?.email_verified) {
          return false;
        }
        return true;
      }

      // For email provider, allow sign in (verification is handled by NextAuth)
      if (account?.provider === "email") {
        return true;
      }

      return true;
    },

    async session({ session, user, token }: any) {
      // Always fetch fresh user data from database
      if (session.user && user) {
        session.user.id = user.id;
        session.user.email = user.email; // Ensure email is always fresh
        session.user.name = user.name;
        session.user.image = user.image;
        session.user.role = user.role || "user";
        session.user.isOnboarded = user.isOnboarded || false;
        session.user.needsOnboarding = !user.isOnboarded;
        session.user.emailVerified = user.emailVerified;
      }
      return session;
    },

    async jwt({ token, user, account }: any) {
      // Clear token cache on new sign in
      if (account && user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/error",
  },
  events: {
    async signOut({ session, token }) {
      // Additional cleanup when user signs out
      console.log("User signed out:", session?.user?.email);
    },
    async signIn({ user, account, profile, isNewUser }) {
      // Log sign in events for debugging
      console.log(
        "User signed in:",
        user.email,
        "Provider:",
        account?.provider,
      );
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
