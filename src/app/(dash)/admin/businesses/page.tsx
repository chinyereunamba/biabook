import BusinessTable from "@/components/admin/businesses";
import BusinessSummary from "@/components/admin/summary";
import type {
  Business,
  BusinessSummary as BusinessSummaryType,
} from "@/types/admin";
import { Suspense } from "react";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/server/db";
import {
  businesses,
  users,
  appointments,
  categories,
} from "@/server/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Business Management | BiaBook Admin",
  description:
    "Manage businesses and their performance on the BiaBook platform",
};

const getBusinesses = async (): Promise<Business[]> => {
  try {
    // Get businesses with owner info and stats
    const businessesData = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        description: businesses.description,
        location: businesses.location,
        phone: businesses.phone,
        email: businesses.email,
        categoryId: businesses.categoryId,
        categoryName: categories.name,
        ownerId: businesses.ownerId,
        ownerName: users.name,
        ownerEmail: users.email,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        totalAppointments: sql<number>`COALESCE(COUNT(${appointments.id}), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(${appointments.servicePrice}), 0)`,
      })
      .from(businesses)
      .leftJoin(users, eq(businesses.ownerId, users.id))
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .leftJoin(appointments, eq(businesses.id, appointments.businessId))
      .groupBy(
        businesses.id,
        businesses.name,
        businesses.slug,
        businesses.description,
        businesses.location,
        businesses.phone,
        businesses.email,
        businesses.categoryId,
        categories.name,
        businesses.ownerId,
        users.name,
        users.email,
        businesses.createdAt,
        businesses.updatedAt,
      )
      .orderBy(desc(businesses.createdAt))
      .limit(100);

    // Convert dates to strings to match the Business type
    return businessesData.map((business) => ({
      ...business,
      createdAt: business.createdAt.toISOString(),
      updatedAt:
        business.updatedAt?.toISOString() || business.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw new Error("Failed to fetch businesses from database");
  }
};

export default async function AdminBusinessesPage() {
  // Check authentication and admin role
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  try {
    const businesses = await getBusinesses();

    // Calculate summary statistics
    const summary: BusinessSummaryType = {
      total: businesses.length,
      active: businesses.filter((b) => b.totalAppointments > 0).length,
      inactive: businesses.filter((b) => b.totalAppointments === 0).length,
      totalRevenue: businesses.reduce(
        (sum, b) => sum + (b.totalRevenue || 0),
        0,
      ),
    };

    return (
      <div className="bg-background min-h-screen max-w-7xl mx-auto">
        <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
          <div className="flex w-full items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-foreground text-2xl font-bold">
                Business Management
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage businesses and their performance on the platform
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <BusinessSummary summary={summary} />
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">
                  Loading businesses...
                </div>
              </div>
            }
          >
            <BusinessTable businesses={businesses} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading businesses:", error);

    return (
      <div className="bg-background min-h-screen w-full">
        <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
          <div className="flex w-full items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-foreground text-2xl font-bold">
                Business Management
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage businesses and their performance on the platform
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-4">
            <h3 className="font-semibold">Error Loading Businesses</h3>
            <p className="mt-1 text-sm">
              Failed to load business data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
