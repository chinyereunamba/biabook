import { db } from "@/server/db";
import {
  users,
  categories,
  businesses,
  services,
  appointments,
} from "@/server/db/schema";

export async function createTestUser(id = "test-user") {
  return await db
    .insert(users)
    .values({
      id,
      name: "Test User",
      email: `${id}@test.com`,
    })
    .returning();
}

export async function createTestCategory(id = "test-category") {
  return await db
    .insert(categories)
    .values({
      id,
      name: "Test Category",
    })
    .returning();
}

export async function createTestBusiness(
  id = "test-business",
  ownerId = "test-user",
  categoryId = "test-category",
) {
  return await db
    .insert(businesses)
    .values({
      id,
      name: "Test Business",
      slug: `${id}-slug`,
      categoryId,
      ownerId,
    })
    .returning();
}

export async function createTestService(
  id = "test-service",
  businessId = "test-business",
) {
  return await db
    .insert(services)
    .values({
      id,
      businessId,
      name: "Test Service",
      duration: 60,
      price: 5000,
      isActive: true,
    })
    .returning();
}

export async function cleanupTestData() {
  // Delete in reverse order of dependencies
  await db.delete(appointments);
  await db.delete(services);
  await db.delete(businesses);
  await db.delete(users);
  await db.delete(categories);
}
