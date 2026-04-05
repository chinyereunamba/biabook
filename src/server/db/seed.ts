import { db } from "./index";
import {
  users,
  businesses,
  categories,
  services,
  weeklyAvailability,
} from "./schema";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const categoryData = [
  { id: "salon", name: "Hair Salons" },
  { id: "fitness", name: "Fitness" },
  { id: "spa", name: "Spa & Wellness" },
  { id: "healthcare", name: "Healthcare" },
];

const userData = [
  { name: "Chinyere Okafor", email: "chinyere.okafor@example.com" },
  { name: "Bolu Adeyemi", email: "bolu.adeyemi@example.com" },
  { name: "Fatima Bello", email: "fatima.bello@example.com" },
  { name: "Emeka Nwosu", email: "emeka.nwosu@example.com" },
];

const businessData = [
  {
    name: "Glow & Go Salon",
    slug: "glow-go-salon",
    categoryId: "salon",
    description: "Modern hair salon specializing in styling and coloring.",
    location: "123 Allen Avenue, Lagos, Nigeria",
    phone: "+2348012345678",
    email: "info@glowgosalon.com",
  },
  {
    name: "Peak Performance Gym",
    slug: "peak-performance-gym",
    categoryId: "fitness",
    description: "State-of-the-art gym with personal training services.",
    location: "45 Murtala Mohammed Way, Abuja, Nigeria",
    phone: "+2348023456789",
    email: "contact@peakgym.ng",
  },
  {
    name: "Serenity Spa & Wellness",
    slug: "serenity-spa-wellness",
    categoryId: "spa",
    description:
      "Relaxing spa offering massages, facials, and wellness treatments.",
    location: "78 Aminu Kano Crescent, Kano, Nigeria",
    phone: "+2348034567890",
    email: "hello@serenityspa.com",
  },
  {
    name: "WellCare Health Clinic",
    slug: "wellcare-health-clinic",
    categoryId: "healthcare",
    description: "Affordable healthcare and medical services for families.",
    location: "22 Enugu Road, Enugu, Nigeria",
    phone: "+2348045678901",
    email: "support@wellcareclinic.com",
  },
];

async function seedCategories() {
  console.log("⏳ Seeding categories...");
  await db.insert(categories).values(categoryData).onConflictDoNothing();
  console.log(`🌱 Seeded ${categoryData.length} categories.`);
}

async function seedUsers() {
  console.log("⏳ Seeding users...");

  const usersToInsert = userData.map((u) => ({
    id: randomUUID(),
    name: u.name,
    email: u.email,
    emailVerified: new Date(), // Use Date object for timestamp
    role: "user" as const,
    isOnboarded: true,
    onboardedAt: new Date(),
  }));

  // Actually insert into DB
  const insertedUsers = await db
    .insert(users)
    .values(usersToInsert)
    .returning();
  console.log(`🌱 Seeded ${insertedUsers.length} users.`);

  return insertedUsers;
}

async function seedBusinesses(
  insertedUsers: Array<{ id: string; name: string | null; email: string }>,
) {
  console.log("⏳ Seeding realistic businesses...");

  const businessesToInsert = businessData.map((biz, index) => {
    const owner = insertedUsers[index];
    if (!owner) {
      throw new Error(`No user found for business ${biz.name}`);
    }

    return {
      id: randomUUID(),
      ...biz,
      ownerId: owner.id,
      coverImage: index === 0 ? "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop" : null,
      profileImage: index === 0 ? "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop" : null,
      createdAt: new Date(), // Use Date object for timestamp
      updatedAt: new Date(),
    };
  });

  const insertedBusinesses = await db
    .insert(businesses)
    .values(businessesToInsert)
    .returning();
  console.log(`🌱 Seeded ${insertedBusinesses.length} businesses!`);

  return insertedBusinesses;
}

async function seedGallery(insertedBusinesses: { id: string; slug: string }[]) {
  console.log("⏳ Seeding gallery images...");
  const galleryImages = [];

  const mainBiz = insertedBusinesses.find(b => b.slug === "glow-go-salon");
  if (mainBiz) {
    const images = [
      { url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop", caption: "Signature Bridal Styling" },
      { url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop", caption: "Precision Cutting & Layering" },
      { url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070&auto=format&fit=crop", caption: "Custom Color & Balayage" },
      { url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?q=80&w=1974&auto=format&fit=crop", caption: "Luxury Treatment Suite" },
      { url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop", caption: "Our Modern Studio Space" },
    ];

    for (let i = 0; i < images.length; i++) {
      galleryImages.push({
        id: randomUUID(),
        businessId: mainBiz.id,
        imageUrl: images[i]!.url,
        caption: images[i]!.caption,
        order: i,
        createdAt: new Date()
      });
    }
  }

  if (galleryImages.length > 0) {
    // Import businessGallery dynamically or use the local reference if available
    // For now, I'll assume it's imported in the top of the file
    const { businessGallery } = await import("./schema");
    await db.insert(businessGallery).values(galleryImages);
    console.log(`🌱 Seeded ${galleryImages.length} gallery images.`);
  }
}

async function seedServices(
  insertedBusinesses: { id: string; name: string }[],
) {
  console.log("⏳ Seeding services for each business...");
  const allServices = [];

  for (const biz of insertedBusinesses) {
    allServices.push(
      {
        id: randomUUID(),
        businessId: biz.id,
        name: `${biz.name} Standard Service`,
        description: `A standard service at ${biz.name}`,
        duration: 60,
        price: 500000, // ₦5,000 in Kobo
        isActive: true,
        bufferTime: 15,
        category: null,
        createdAt: new Date(), // Use Date object for timestamp
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        businessId: biz.id,
        name: `${biz.name} Premium Service`,
        description: `A premium service at ${biz.name}`,
        duration: 90,
        price: 1000000, // ₦10,000 in Kobo
        isActive: true,
        bufferTime: 15,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );
  }

  await db.insert(services).values(allServices);
  console.log(`🌱 Seeded ${allServices.length} services.`);
}

async function seedWeeklyAvailability(insertedBusinesses: { id: string }[]) {
  console.log("⏳ Seeding weekly availability...");

  const availabilities = [];

  for (const biz of insertedBusinesses) {
    // Monday to Friday 9AM-5PM
    for (let day = 1; day <= 5; day++) {
      availabilities.push({
        id: randomUUID(),
        businessId: biz.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
        createdAt: new Date(), // Use Date object for timestamp
        updatedAt: new Date(),
      });
    }
  }

  await db.insert(weeklyAvailability).values(availabilities);
  console.log(
    `🌱 Seeded weekly availability for ${insertedBusinesses.length} businesses.`,
  );
}

async function main() {
  try {
    console.log("🧹 Cleaning up previous data...");
    await db.delete(weeklyAvailability);
    await db.delete(services);
    await db.delete(businesses);
    // await db.delete(users);
    await db.delete(categories);

    await seedCategories();
    const insertedUsers = await seedUsers();
    const insertedBusinesses = await seedBusinesses(insertedUsers);
    await seedGallery(insertedBusinesses);
    await seedServices(insertedBusinesses);
    await seedWeeklyAvailability(insertedBusinesses);

    console.log("✅ Database seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

main();
