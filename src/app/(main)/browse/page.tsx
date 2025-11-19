"use client";

import { LocationSearch } from "@/components/home/browse/location-search";
import { LocationAwareBusinessList } from "@/components/home/browse/location-aware-business-list";
import { BusinessSkeleton } from "@/components/home/browse/business-list-skeleton";
import SearchBusiness from "@/components/home/browse/search-business";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { LocationSearchParams } from "@/components/home/browse/location-search";
import type { BusinessSearchResult } from "@/server/services/proximity-search-service";
import type { Coordinates } from "@/types/location";

function FindBusinessContent() {
  const searchParams = useSearchParams();
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [locationBusinesses, setLocationBusinesses] = useState<
    BusinessSearchResult[]
  >([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchLocation, setSearchLocation] = useState<Coordinates | null>(
    null,
  );
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [useLocationSearch, setUseLocationSearch] = useState(false);

  // Get current filter values
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "name";
  const currentOrder = searchParams.get("order") || "asc";

  // Load all data once on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all businesses without filters for client-side filtering
        const res = await fetch("/api/businesses", {
          headers: {
            "Content-Type": "application/json",
          },
        });
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

  // Handle location-based search
  const handleLocationSearch = useCallback(
    async (params: LocationSearchParams) => {
      setIsLocationSearching(true);
      setUseLocationSearch(true);

      try {
        const searchBody = {
          coordinates: params.coordinates,
          address: params.address,
          zipCode: params.zipCode,
          radius: params.radius,
          categoryId: currentCategory || undefined,
          sortBy: "distance",
          limit: 50,
        };

        const response = await fetch("/api/businesses/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchBody),
        });

        if (!response.ok) {
          throw new Error("Failed to search businesses");
        }

        const data = await response.json();
        setLocationBusinesses(data.businesses || []);
        setSearchLocation(data.searchLocation || null);
        setSearchRadius(params.radius);
      } catch (error) {
        console.error("Failed to search businesses by location:", error);
        setLocationBusinesses([]);
      } finally {
        setIsLocationSearching(false);
      }
    },
    [currentCategory],
  );

  // Handle clearing location search
  const handleLocationClear = useCallback(() => {
    setUseLocationSearch(false);
    setLocationBusinesses([]);
    setSearchLocation(null);
    setSearchRadius(null);
  }, []);

  // Client-side filtering and sorting for regular search
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

  const isLoadingAny = isLoading || isTransitioning || isLocationSearching;
  const businessesToShow = useLocationSearch
    ? locationBusinesses
    : filteredBusinesses;

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

          {/* Location-based Search */}
          {/* <div className="mb-6">
            <LocationSearch
              onLocationSearch={handleLocationSearch}
              onLocationClear={handleLocationClear}
              isLoading={isLocationSearching}
            />
          </div> */}

          {/* Traditional Search (only show if not using location search) */}
          {/* {!useLocationSearch && ( */}
          <SearchBusiness
            categories={categories}
            onLoadingChange={handleLoadingChange}
          />
          {/* )} */}
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoadingAny ? (
            <BusinessSkeleton />
          ) : useLocationSearch ? (
            <LocationAwareBusinessList
              businesses={locationBusinesses}
              searchLocation={searchLocation || undefined}
              searchRadius={searchRadius || undefined}
              isLoading={isLocationSearching}
              showMap={true}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {businessesToShow.length} businesses found
                </h2>
                <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option>Sort by: Rating</option>
                  <option>Sort by: Price</option>
                  <option>Sort by: Distance</option>
                </select>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {businessesToShow.map((business: any) => (
                  <div
                    key={business.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="from-primary/20 to-accent/20 flex h-48 items-center justify-center bg-gradient-to-br">
                      <span className="text-6xl">🏢</span>
                    </div>

                    <div className="p-6">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {business.name}
                        </h3>
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {business.category}
                        </span>
                      </div>

                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {business.rating}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({business.reviews})
                        </span>
                      </div>

                      <div className="mb-3 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>📍</span>
                        {business.location}
                      </div>

                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {business.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {business.priceRange}
                        </span>
                        <button
                          onClick={() =>
                            (window.location.href = `/book/${business.id}`)
                          }
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
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
