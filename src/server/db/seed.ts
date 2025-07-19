import { db } from "./index"; // your Drizzle client
import { categories, businesses } from "./schema";

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
    categoryId: "salon",
    description: "Natural & protective hairstyles.",
    location: "Lekki, Lagos",
    phone: "+2348123456789",
    email: "glowup@salon.ng",
  },
  {
    id: "biz2",
    name: "SmartBrains Tutors",
    categoryId: "education",
    description: "Tutoring for JAMB, WAEC, kids.",
    location: "Enugu, Nigeria",
    phone: "+2348098765432",
    email: "smartbrains@edu.ng",
  },
  {
    id: "biz3",
    name: "Fit247 Gym",
    categoryId: "fitness",
    description: "24/7 gym with trainers & classes.",
    location: "Yaba, Lagos",
    phone: "+2348034567890",
    email: "fit247@fitness.ng",
  },
  {
    id: "biz4",
    name: "BellaMed Clinic",
    categoryId: "healthcare",
    description: "Affordable outpatient clinic.",
    location: "Port Harcourt",
    phone: "+2349012345678",
    email: "bellamed@health.ng",
  },
  {
    id: "biz5",
    name: "Zen Spa Lounge",
    categoryId: "spa",
    description: "Massages & facials.",
    location: "Abuja",
    phone: "+2348101234567",
    email: "zen@spa.ng",
  },
  {
    id: "biz6",
    name: "Cuts & Co.",
    categoryId: "salon",
    description: "Premium barbershop.",
    location: "Ikeja, Lagos",
    phone: "+2347055555555",
    email: "cuts@barber.ng",
  },
  {
    id: "biz7",
    name: "Excel Tutors Hub",
    categoryId: "education",
    description: "Secondary school tutoring.",
    location: "Owerri",
    phone: "+2348088888888",
    email: "excel@edu.ng",
  },
  {
    id: "biz8",
    name: "Healing Touch",
    categoryId: "healthcare",
    description: "Pediatric and maternal care.",
    location: "Ilorin",
    phone: "+2347012345678",
    email: "healing@clinic.ng",
  },
  {
    id: "biz9",
    name: "Blissful Body Spa",
    categoryId: "spa",
    description: "Aromatherapy & reflexology.",
    location: "Abeokuta",
    phone: "+2347067890123",
    email: "bliss@spa.ng",
  },
  {
    id: "biz10",
    name: "HomeFit Coach",
    categoryId: "fitness",
    description: "Virtual coaching on WhatsApp.",
    location: "Jos",
    phone: "+2348023456789",
    email: "homefit@fit.ng",
  },
];

async function main() {
  await db.insert(categories).values(categoryData).onConflictDoNothing();
  await db.insert(businesses).values(businessData).onConflictDoNothing();
  console.log("✅ Database seeded successfully!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
