import { NextResponse } from "next/server";
import { businessRepository } from "@/server/repositories/business-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { categoryRepository } from "@/server/repositories/category-repository";

export async function GET() {
  try {
    // Fetch all businesses with their categories
    const businesses = await businessRepository.findAll();

    // Fetch categories for reference
    const categories = await categoryRepository.findAll();
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

    // Fetch services for each business
    const businessesWithServices = await Promise.all(
      businesses.map(async (business) => {
        const services = await serviceRepository.findByBusinessId(business.id);
        const category = categoryMap.get(business.categoryId) || "Unknown";

        return {
          id: business.id,
          name: business.name,
          description: business.description || "",
          category: category,
          categoryId: business.categoryId,
          location: business.location || "",
          phone: business.phone || "",
          email: business.email || "",
          services: services.map((service) => service.name),
          serviceCount: services.length,
          // Mock data for UI (these would come from actual business data)
          rating: 4.5,
          reviews: Math.floor(Math.random() * 50) + 10,
          priceRange: "$50 - $150",
        };
      }),
    );

    return NextResponse.json({ businesses: businessesWithServices });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 },
    );
  }
}
