import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUserWithCredentials(
  email: string,
  password: string,
  name?: string,
) {
  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Admin emails - add your admin emails here
  const adminEmails = [
    "chinyereunamba15@gmail.com",
    "admin@biabook.app",
    // Add more admin emails as needed
  ];

  // Assign role based on email
  const role = adminEmails.includes(email) ? "admin" : "user";

  // Create user
  const result = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: name || null,
      email,
      password: hashedPassword,
      role: role as "user" | "admin",
      emailVerified: null, // Will be verified via email confirmation
    })
    .returning();

  const newUser = result[0];

  if (!newUser) {
    throw new Error("Failed to create user");
  }

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    isOnboarded: newUser.isOnboarded,
  };
}

export async function authenticateUser(email: string, password: string) {
  // Find user by email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const foundUser = user[0];

  if (!foundUser) {
    return null;
  }

  // Check if user has a password (credentials user)
  if (!foundUser.password) {
    return null;
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, foundUser.password);

  if (!isValidPassword) {
    return null;
  }

  return {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    role: foundUser.role,
    isOnboarded: foundUser.isOnboarded,
    emailVerified: foundUser.emailVerified,
  };
}
