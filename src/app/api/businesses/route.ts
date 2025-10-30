import { NextResponse } from "next/server";
import { businessRepository } from "@/server/repositories/business-repository";
import { serviceRepository } from "@/server/repositories/service-repository";
import { categoryRepository } from "@/server/repositories/category-repository";

type SortableKey = "name" | "category" | "rating" | "serviceCount";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const sortParam = searchParams.get("sort") || "name"; // e.g. "name" | "rating" | "serviceCount"
    const order = searchParams.get("order") || "asc"; // "asc" or "desc"
    const categoryFilter = searchParams.get("category")?.toLowerCase() || "";

    const sort: SortableKey = [
      "name",
      "category",
      "rating",
      "serviceCount",
    ].includes(sortParam)
      ? (sortParam as SortableKey)
      : "name";

    // Fetch base data
    const businesses = await businessRepository.findAll();
    const categories = await categoryRepository.findAll();
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

    // Optimize: Get all services in one query instead of N+1 queries
    const allServices = await serviceRepository.findAll();
    const servicesByBusiness = new Map<string, typeof allServices>();

    allServices.forEach((service) => {
      if (!servicesByBusiness.has(service.businessId)) {
        servicesByBusiness.set(service.businessId, []);
      }
      servicesByBusiness.get(service.businessId)!.push(service);
    });

    const businessesWithServices = businesses.map((business) => {
      const services = servicesByBusiness.get(business.id) || [];
      const category = categoryMap.get(business.categoryId) ?? "Unknown";

      return {
        id: business.id,
        name: business.name,
        description: business.description ?? "",
        category,
        categoryId: business.categoryId,
        location: business.location ?? "",
        phone: business.phone ?? "",
        email: business.email ?? "",
        services: services.map((s) => s.name),
        serviceCount: services.length,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 50) + 10,
        priceRange: "$50 - $150",
      };
    });

    // 🔎 Filter by search term (name, category, or service name)

    let filtered = businessesWithServices.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search) ||
        b.category.toLowerCase().includes(search) ||
        b.services.some((s) => s.toLowerCase().includes(search));

      const matchesCategory = categoryFilter
        ? b.category.toLowerCase() === categoryFilter
        : true;

      return matchesSearch && matchesCategory;
    });

    // 🔄 Sort dynamically
    filtered = filtered.sort((a, b) => {
      const dir = order === "asc" ? 1 : -1;

      if (sort === "rating" || sort === "serviceCount") {
        return (a[sort] - b[sort]) * dir;
      }

      // Default: alphabetical sort
      return a[sort].toString().localeCompare(b[sort].toString()) * dir;
    });

    return NextResponse.json({ businesses: filtered, categories });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 },
    );
  }
}
