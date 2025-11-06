import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/server/db/schema";
import { sendWelcomeEmail } from "@/lib/email";
import { authenticateUser } from "@/lib/auth-utils";

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
        password: user.password || null, // Handle password for credentials users
        role: role as "user" | "admin",
      })
      .returning();

    const newUser = result[0];

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // Send welcome email to new user (only for OAuth users who are already verified)
    // For credentials users, welcome email is sent after email verification
    if (newUser.email && newUser.emailVerified && !newUser.password) {
      try {
        await sendWelcomeEmail({
          to: newUser.email,
          name: newUser.name || undefined,
        });
        console.log(`Welcome email sent to ${newUser.email} (OAuth)`);
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
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET!,
  adapter: customAdapter as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await authenticateUser(
            credentials.email as string,
            credentials.password as string,
          );

          if (!user) {
            return null;
          }

          // Check if email is verified for credentials users
          if (!user.emailVerified) {
            throw new Error("Please verify your email before signing in");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isOnboarded: user.isOnboarded,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
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

      // For credentials provider, allow sign in (authentication is handled in authorize)
      if (account?.provider === "credentials") {
        return true;
      }

      return true;
    },

    async session({ session, user, token }: any) {
      // Always fetch fresh user data from database
     if (session.user && token) {
       session.user.id = token.sub;
       session.user.email = token.email;
       session.user.name = token.name;
       session.user.image = token.picture;
       session.user.role = token.role || "user";
       session.user.isOnboarded = token.isOnboarded ?? false;
       session.user.needsOnboarding = !token.isOnboarded;
       session.user.emailVerified = token.emailVerified ?? false;
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
        token.isOnboarded = user.isOnboarded;
        token.emailVerified = user.emailVerified;
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
    async signOut({ session, token }: any) {
      // Additional cleanup when user signs out
      console.log("User signed out:", session?.user?.email, token);
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
