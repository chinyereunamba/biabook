import { db } from "./index"; // your Drizzle client
import {
  categories,
  businesses,
  services,
  weeklyAvailability,
  users,
} from "./schema";

const userData = [
  {
    id: "mock-user-id",
    name: "Mock Business Owner",
    email: "owner@mockbusiness.com",
  },
];

const categoryData = [
  { id: "all", name: "All Categories" },
  { id: "salon", name: "Hair Salons" },
  { id: "education", name: "Tutoring" },
  { id: "healthcare", name: "Healthcare" },
  { id: "spa", name: "Spa & Wellness" },
  { id: "fitness", name: "Fitness" },
];

const businessData = [
  {
    id: "biz1",
    name: "GlowUp Hair Studio",
    slug: "glowup-hair-studio",
    categoryId: "salon",
    description: "Natural & protective hairstyles.",
    location: "Lekki, Lagos",
    phone: "+2348123456789",
    email: "glowup@salon.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz2",
    name: "SmartBrains Tutors",
    slug: "smartbrains-tutors",
    categoryId: "education",
    description: "Tutoring for JAMB, WAEC, kids.",
    location: "Enugu, Nigeria",
    phone: "+2348098765432",
    email: "smartbrains@edu.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz3",
    name: "Fit247 Gym",
    slug: "fit247-gym",
    categoryId: "fitness",
    description: "24/7 gym with trainers & classes.",
    location: "Yaba, Lagos",
    phone: "+2348034567890",
    email: "fit247@fitness.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz4",
    name: "BellaMed Clinic",
    slug: "bellamed-clinic",
    categoryId: "healthcare",
    description: "Affordable outpatient clinic.",
    location: "Port Harcourt",
    phone: "+2349012345678",
    email: "bellamed@health.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz5",
    name: "Zen Spa Lounge",
    slug: "zen-spa-lounge",
    categoryId: "spa",
    description: "Massages & facials.",
    location: "Abuja",
    phone: "+2348101234567",
    email: "zen@spa.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz6",
    name: "Cuts & Co.",
    slug: "cuts-and-co",
    categoryId: "salon",
    description: "Premium barbershop.",
    location: "Ikeja, Lagos",
    phone: "+2347055555555",
    email: "cuts@barber.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz7",
    name: "Excel Tutors Hub",
    slug: "excel-tutors-hub",
    categoryId: "education",
    description: "Secondary school tutoring.",
    location: "Owerri",
    phone: "+2348088888888",
    email: "excel@edu.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz8",
    name: "Healing Touch",
    slug: "healing-touch",
    categoryId: "healthcare",
    description: "Pediatric and maternal care.",
    location: "Ilorin",
    phone: "+2347012345678",
    email: "healing@clinic.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz9",
    name: "Blissful Body Spa",
    slug: "blissful-body-spa",
    categoryId: "spa",
    description: "Aromatherapy & reflexology.",
    location: "Abeokuta",
    phone: "+2347067890123",
    email: "bliss@spa.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "biz10",
    name: "HomeFit Coach",
    slug: "homefit-coach",
    categoryId: "fitness",
    description: "Virtual coaching on WhatsApp.",
    location: "Jos",
    phone: "+2348023456789",
    email: "homefit@fit.ng",
    ownerId: "mock-user-id",
  },
  {
    id: "mock-business-id",
    name: "Bella Hair Salon",
    slug: "bella-hair-salon",
    categoryId: "salon",
    description:
      "Professional hair salon offering premium cuts, colors, and styling services in a relaxing environment.",
    location: "123 Main St, City, State",
    phone: "+1 234-567-8900",
    email: "bella@salon.com",
    ownerId: "mock-user-id",
  },
];

const serviceData = [
  // Hair Salon Services
  {
    id: "service1",
    businessId: "biz1",
    name: "Hair Cut & Style",
    description: "Professional cut and styling",
    duration: 45,
    price: 5000, // 50 NGN in kobo
    isActive: true,
    bufferTime: 15,
  },
  {
    id: "service2",
    businessId: "biz1",
    name: "Hair Color",
    description: "Full color treatment with consultation",
    duration: 120,
    price: 12000, // 120 NGN in kobo
    isActive: true,
    bufferTime: 30,
  },
  // Mock business services
  {
    id: "service3",
    businessId: "mock-business-id",
    name: "Hair Cut & Style",
    description: "Professional cut and styling",
    duration: 45,
    price: 5000,
    isActive: true,
    bufferTime: 15,
  },
  {
    id: "service4",
    businessId: "mock-business-id",
    name: "Hair Color",
    description: "Full color treatment with consultation",
    duration: 120,
    price: 12000,
    isActive: true,
    bufferTime: 30,
  },
];

const availabilityData = [
  // Mock business availability (Monday to Friday, 9 AM to 5 PM)
  {
    businessId: "mock-business-id",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    businessId: "mock-business-id",
    dayOfWeek: 2,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    businessId: "mock-business-id",
    dayOfWeek: 3,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    businessId: "mock-business-id",
    dayOfWeek: 4,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    businessId: "mock-business-id",
    dayOfWeek: 5,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    businessId: "mock-business-id",
    dayOfWeek: 6,
    startTime: "10:00",
    endTime: "15:00",
    isAvailable: true,
  },

  // Hair salon availability
  {
    businessId: "biz1",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true,
  },
  {
    businessId: "biz1",
    dayOfWeek: 2,
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true,
  },
  {
    businessId: "biz1",
    dayOfWeek: 3,
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true,
  },
  {
    businessId: "biz1",
    dayOfWeek: 4,
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true,
  },
  {
    businessId: "biz1",
    dayOfWeek: 5,
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true,
  },
  {
    businessId: "biz1",
    dayOfWeek: 6,
    startTime: "10:00",
    endTime: "16:00",
    isAvailable: true,
  },
];

async function main() {
  await db.insert(users).values(userData).onConflictDoNothing();
  await db.insert(categories).values(categoryData).onConflictDoNothing();
  await db.insert(businesses).values(businessData).onConflictDoNothing();
  await db.insert(services).values(serviceData).onConflictDoNothing();
  await db
    .insert(weeklyAvailability)
    .values(availabilityData)
    .onConflictDoNothing();
  console.log("✅ Database seeded successfully!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
