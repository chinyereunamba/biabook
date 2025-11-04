// app/admin/businesses/page.tsx
import BusinessTable from "@/components/admin/businesses";
import BusinessSummary from "@/components/admin/summary";
import type { Business } from "@/types/admin";
import { Suspense } from "react";

const getBusinesses = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/businesses`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch businesses");
  return res.json();
};

export default async function AdminBusinessesPage() {
  const data = await getBusinesses();

  const totalRevenue =
    data.businesses.reduce(
      (sum: number, b: Business) => sum + (b.totalRevenue || 0),
      0,
    ) || 0;

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
        <BusinessSummary summary={totalRevenue} />
        <Suspense fallback="Loading businesses...">
          <BusinessTable businesses={data.businesses} />
        </Suspense>
      </div>
    </div>
  );
}
