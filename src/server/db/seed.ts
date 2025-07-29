import { db } from "./index";
import {
  users,
  businesses,
  services,
  categories,
  weeklyAvailability,
} from "./schema";
import { sql } from "drizzle-orm";

const categoryData = [
  { id: "all", name: "All Categories" },
  { id: "salon", name: "Hair Salons" },
  { id: "education", name: "Tutoring" },
  { id: "healthcare", name: "Healthcare" },
  { id: "spa", name: "Spa & Wellness" },
  { id: "fitness", name: "Fitness" },
];

async function main() {
  console.log("⏳ Seeding database...");

  // Clean up existing data
  await db.delete(services);
  await db.delete(weeklyAvailability);
  await db.delete(businesses);
  await db.delete(users);
  await db.delete(categories);

  console.log("🧹 Cleaned up existing data.");

  // Insert categories
  await db.insert(categories).values(categoryData).onConflictDoNothing();
  console.log("🌱 Seeded categories.");

  // Create 4 users
  const createdUsers = await db
    .insert(users)
    .values([
      {
        name: "Chinyere Okafor",
        email: "chinyere.okafor@example.com",
      },
      {
        name: "Bolu Adeyemi",
        email: "bolu.adeyemi@example.com",
      },
      {
        name: "Fatima Bello",
        email: "fatima.bello@example.com",
      },
      {
        name: "Emeka Nwosu",
        email: "emeka.nwosu@example.com",
      },
    ])
    .returning();

  console.log(`🌱 Seeded ${createdUsers.length} users.`);

  if (createdUsers.length < 4) {
    throw new Error("Failed to create users");
  }

  // Create 4 businesses, each owned by one of the users
  const createdBusinesses = await db
    .insert(businesses)
    .values([
      {
        id: "biz1",
        name: "Chinyere's Hair Haven",
        slug: "chinyere-hair-haven",
        categoryId: "salon",
        description: "Premium hair care and styling.",
        location: "Lagos, Nigeria",
        phone: "+2348012345678",
        email: "chinyere.hair@example.com",
        ownerId: createdUsers[0]!.id,
      },
      {
        id: "biz2",
        name: "Bolu's Fitness Hub",
        slug: "bolu-fitness-hub",
        categoryId: "fitness",
        description: "State-of-the-art gym and personal training.",
        location: "Abuja, Nigeria",
        phone: "+2348023456789",
        email: "bolu.fitness@example.com",
        ownerId: createdUsers[1]!.id,
      },
      {
        id: "biz3",
        name: "Fatima's Wellness Spa",
        slug: "fatima-wellness-spa",
        categoryId: "spa",
        description: "Relax, rejuvenate, and refresh.",
        location: "Kano, Nigeria",
        phone: "+2348034567890",
        email: "fatima.spa@example.com",
        ownerId: createdUsers[2]!.id,
      },
      {
        id: "biz4",
        name: "Emeka's Health Clinic",
        slug: "emeka-health-clinic",
        categoryId: "healthcare",
        description: "Affordable and accessible healthcare for all.",
        location: "Enugu, Nigeria",
        phone: "+2348045678901",
        email: "emeka.clinic@example.com",
        ownerId: createdUsers[3]!.id,
      },
    ])
    .returning();

  console.log(`🌱 Seeded ${createdBusinesses.length} businesses.`);

  if (createdBusinesses.length < 4) {
    throw new Error("Failed to create businesses");
  }

  // Create 4 services for each business
  const allServices = [];
  for (const business of createdBusinesses) {
    for (let i = 1; i <= 4; i++) {
      allServices.push({
        businessId: business.id,
        name: `Service ${i} for ${business.name}`,
        description: `This is service number ${i} for ${business.name}.`,
        duration: 30 + i * 15, // 45, 60, 75, 90 minutes
        price: 5000 + i * 1000, // 6000, 7000, 8000, 9000 kobo
        isActive: true,
        bufferTime: 10,
      });
    }
  }

  if (allServices.length > 0) {
    await db.insert(services).values(allServices);
    console.log(`🌱 Seeded ${allServices.length} services.`);
  }

  // Create weekly availability for each business (Mon-Fri, 9-5)
  const allAvailabilities = [];
  for (const business of createdBusinesses) {
    for (let day = 1; day <= 5; day++) {
      allAvailabilities.push({
        businessId: business.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      });
    }
  }

  if (allAvailabilities.length > 0) {
    await db.insert(weeklyAvailability).values(allAvailabilities);
    console.log(
      `🌱 Seeded weekly availability for ${createdBusinesses.length} businesses.`
    );
  }

  console.log("✅ Database seeded successfully!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
