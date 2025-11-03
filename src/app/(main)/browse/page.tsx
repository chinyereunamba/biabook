"use client";

import BrowseBusiness from "@/components/home/browse/business-list";
import { BusinessSkeleton } from "@/components/home/browse/business-list-skeleton";
import SearchBusiness from "@/components/home/browse/search-business";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FindBusinessContent() {
  const searchParams = useSearchParams();
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current filter values
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "name";
  const currentOrder = searchParams.get("order") || "asc";

  // Load all data once on mount
  useEffect(() => {
    const fetchAllData = async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      try {
        // Fetch all businesses without filters for client-side filtering
        const res = await fetch(`${baseUrl}/api/businesses`);
        const data = await res.json();
        setAllBusinesses(data.businesses || []);
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch businesses:", error);
        setAllBusinesses([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Client-side filtering and sorting for instant results
  const filteredBusinesses = useMemo(() => {
    if (!allBusinesses.length) return [];

    let filtered = allBusinesses.filter((business: any) => {
      const matchesSearch =
        !currentSearch ||
        business.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        business.category.toLowerCase().includes(currentSearch.toLowerCase()) ||
        business.services.some((s: string) =>
          s.toLowerCase().includes(currentSearch.toLowerCase()),
        );

      const matchesCategory =
        !currentCategory ||
        business.category.toLowerCase() === currentCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a: any, b: any) => {
      const dir = currentOrder === "asc" ? 1 : -1;

      if (currentSort === "rating" || currentSort === "serviceCount") {
        return (a[currentSort] - b[currentSort]) * dir;
      }

      return (
        a[currentSort].toString().localeCompare(b[currentSort].toString()) * dir
      );
    });

    return filtered;
  }, [
    allBusinesses,
    currentSearch,
    currentCategory,
    currentSort,
    currentOrder,
  ]);

  // Handle loading state changes from search component
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsTransitioning(loading);
    // Clear transition state after a short delay to show immediate feedback
    if (loading) {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, []);

  return (
    <>
      {/* Search Hero */}
      <section className="from-primary to-primary/80 bg-gradient-to-r py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-primary-foreground mb-4 text-center text-4xl font-bold">
            Find & Book Local Services
          </h1>
          <p className="text-primary-foreground/90 mb-8 text-center">
            Discover amazing businesses near you and book appointments instantly
          </p>
          <SearchBusiness
            categories={categories}
            onLoadingChange={handleLoadingChange}
          />
        </div>
      </section>

      {/* Show skeleton immediately when transitioning or initially loading */}
      {isLoading || isTransitioning ? (
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BusinessSkeleton />
          </div>
        </div>
      ) : (
        <BrowseBusiness businesses={filteredBusinesses} />
      )}
    </>
  );
}

// Disable static generation for this page since it uses search params
export const dynamic = "force-dynamic";

export default function FindBusinessPage() {
  return (
    <Suspense fallback={<FindBusinessPageFallback />}>
      <FindBusinessContent />
    </Suspense>
  );
}

function FindBusinessPageFallback() {
  return (
    <>
      {/* Search Hero */}
      <section className="from-primary to-primary/80 bg-gradient-to-r py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-primary-foreground mb-4 text-center text-4xl font-bold">
            Find & Book Local Services
          </h1>
          <p className="text-primary-foreground/90 mb-8 text-center">
            Discover amazing businesses near you and book appointments instantly
          </p>
          <div className="mx-auto max-w-2xl">
            <div className="animate-pulse">
              <div className="mb-4 h-12 rounded-lg bg-white/20"></div>
              <div className="flex gap-4">
                <div className="h-10 flex-1 rounded bg-white/20"></div>
                <div className="h-10 w-32 rounded bg-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading skeleton */}
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BusinessSkeleton />
        </div>
      </div>
    </>
  );
}
