"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Star, Map as MapIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BusinessSkeleton } from "@/components/home/browse/business-list-skeleton";
import { ArtisanCard } from "@/components/ui/artisan-card";
import { Button } from "@/components/ui/button";
function FindBusinessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All Services");

  // Get current filter values
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";

  // Load data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch("/api/businesses");
        const data = await res.json();
        setAllBusinesses(data.businesses || []);
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch businesses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Update URL and state on filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category === "All Services") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.replace(`/browse?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    // Debounce would be better, but keeping it simple for now
    router.replace(`/browse?${params.toString()}`);
  };

  const filteredBusinesses = useMemo(() => {
    return allBusinesses.filter((business: any) => {
      const matchesSearch =
        !currentSearch ||
        business.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        business.category.toLowerCase().includes(currentSearch.toLowerCase());

      const categoryMatch =
        !currentCategory ||
        currentCategory === "All Services" ||
        business.category.toLowerCase() === currentCategory.toLowerCase();

      return matchesSearch && categoryMatch;
    });
  }, [allBusinesses, currentSearch, currentCategory]);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-6 pt-8 mb-12">
        <div className="relative bg-primary-container rounded-[2.5rem] p-8 md:p-16 overflow-hidden flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-primary/20">
          <div className="relative z-10 w-full md:w-1/2">
            <span className="inline-block bg-primary-fixed text-secondary-container px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 font-sans">
              Discover Local Artisans
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Excellence in <br /><span className="text-secondary-container italic">Every Detail.</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-md font-sans">
              Book Nigeria’s finest tailors, barbers, and creative consultants with artisan precision and modern ease.
            </p>
          </div>
          <div className="w-full md:w-1/2 relative h-64 md:h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-transparent opacity-40 rounded-[2rem]"></div>
            <img
              alt="Nigerian Artisan"
              className="w-full h-full object-cover rounded-[2rem] transform rotate-3 shadow-2xl scale-105 transition-transform hover:rotate-0 duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdoK10oOg41c8ZZy-iYIkdMJ_g_a8gRUQLuLF6v6ercaP_S_Eo2nsFzJeILg7hfBZ-Ugj3GmwZMpGsTkTVQ5gog4P1RYcvOMZt5XCUlhmqHJAhVKRwSTrsUrKmAT_7V3YkYbfnK3lnr1s_TUDPzCe1IFpfOG-bDdsXMQo8jnY_qndUeZKFl1RuURsEv9EEMd9uHIViroBiZg9C4gcqe6mPz5utc2ZIiuC-RyAQJ66rcpp_IERW5_Y2MgGfLgSQA19T3Sw8tUZ4XEF7"
            />
          </div>
        </div>
      </header>

      {/* Integrated Search & Filters */}
      <section className="max-w-7xl mx-auto px-6 mb-16 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Search Input */}
          <div className="flex-1 group relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary text-2xl">search</span>
            </div>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-5 pl-14 pr-6 text-on-surface focus:ring-2 focus:ring-primary/20 shadow-sm transition-all font-sans placeholder:text-on-surface-variant/40 outline-none"
              placeholder="Find a service (e.g. Barber, Consultant)"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Location Selector */}
          <div className="md:w-72 flex items-center bg-surface-container-lowest rounded-2xl px-6 py-4 shadow-sm border border-outline-variant/10 group">
            <span className="material-symbols-outlined text-secondary mr-3 text-2xl group-hover:scale-110 transition-transform">location_on</span>
            <select className="bg-transparent border-none focus:ring-0 text-on-surface font-bold font-display w-full outline-none cursor-pointer appearance-none">
              <option>Lagos, Nigeria</option>
              <option>Abuja, FCT</option>
              <option>Ibadan, Oyo</option>
              <option>Port Harcourt</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {["All Services", "Beauty", "Fashion", "Professional", "Home Care", "Wellness", "Creative"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-3 rounded-full whitespace-nowrap font-bold transition-all duration-300 text-sm font-sans ${(currentCategory || "All Services") === cat
                ? "bg-primary text-white shadow-lg shadow-primary/20 translate-y-[-2px]"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Artisans Near You Grid */}
      <section className="bg-surface-container-low/50 py-24 mb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-2">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-primary tracking-tight">Artisans Near You</h2>
              <p className="text-on-surface-variant text-lg font-sans">
                Skilled professionals within 5km of your location in <span className="text-secondary font-bold">Lagos</span>.
              </p>
            </div>
            <Button variant="secondary" className="hidden md:flex text-white px-8 py-4 rounded-2xl font-bold items-center gap-3 transition-all shadow-xl shadow-secondary/20 font-display">
              <span className="material-symbols-outlined">map</span>
              View Map
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {isLoading ? (
              <div className="col-span-full">
                <BusinessSkeleton />
              </div>
            ) : filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business: any, idx: number) => (
                <ArtisanCard
                  key={business.id}
                  id={business.id}
                  slug={business.slug}
                  name={business.name}
                  category={business.category}
                  image={business.image || (idx === 0 ? "https://lh3.googleusercontent.com/aida-public/AB6AXuAXJ1DD0eq7P91EtNPVYSu1I_Sshk34dxCqK0-Xk2UsZCDw7mFyuZznEGL_dzar4PfNXi2sbYJvarJU62co7WAUQFG3HZHfOYwcQa3TWUIn8sWO3QBu6i3v_UUogB49dskAE1vzTKg3SRodzC_iMXOThOwc4VledvTM7vYnQ2RDRpvDbXhct0llS5CyOtZIyI5n58_NHCwQRicjCpU2pLdHD4RxEvelXwEV4hOtRUeWTaAU78iDd6ilF_UIi2Y8I1BBcCxhGDPjUVDY" : idx === 1 ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBs0TmAj9WmEunPAvfr3N3tTgfXdSQtF4y8ko9BFYzMXZebIf9yJAB2LqK7Vk8pPc3lQG_2rajR1B7tNa4IMOAauLWcSl-MgdxkkQtGyFYeXQ4yhVtK2-JTpegeD0KmEYPBfMFdA6lXQpfXyqGkmHVW2G37bpv-JZVFRkjYpYMa0lI4JOlXgTznYpSs5NOzawfCwwExqIO0yHz8zVvpQkYvUW16ZLeRXy4cscTSFs7gFRWQzzBm0pSIMtnJrHA6S6mWmcoqNBRWRFBB" : "https://lh3.googleusercontent.com/aida-public/AB6AXuBIVrIZeB8HWG9gd_EG3KOTtMpsjJMD3W31rP5sLC17GMpmQ4fp9wwDaWOl4cojlLR7ujFwae-vczjuOxUFZzg2OKlYEWNa0iNDEGoeRkjlw6uGgthwAGfGLs9RaCt_lR-vwKhejpa-3wKtAVDgxBqciwPdGXJooXZnBfuHtl701bTFkXv1ty6pqsFE_KD-IYpdvWruQXjW4Oggws50RDBdL5M3oq-lV4NwXpw8EA0TZH5LWnBWkSReRrA4yB6YqPOZhr9qIPDfQsjX")}
                  rating={4.8}
                  price={business.formattedPrice}
                  description={business.description}
                  variant="grid"
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center space-y-4">
                <div className="material-symbols-outlined text-6xl text-on-surface-variant/20 italic">search_off</div>
                <h3 className="text-2xl font-bold text-primary font-display tracking-tight">No artisans found</h3>
                <p className="text-on-surface-variant font-sans">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Masterclass Selection (Horizontal Scroll) */}
      {/* <section className="pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="font-display text-4xl font-extrabold text-primary tracking-tight">Masterclass Selection</h2>
            <p className="text-on-surface-variant text-lg font-sans opacity-80">Top-rated artisans with exceptional reviews.</p>
          </div>
          <button className="text-secondary font-bold flex items-center gap-2 group font-display text-lg">
            View all
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
          </button>
        </div>

        <div className="flex gap-10 overflow-x-auto no-scrollbar px-6 md:px-[calc((100vw-80rem)/2+1.5rem)] snap-x">
          <ArtisanCard
            id="heritage-barbers"
            name="The Heritage Barbers"
            category="Barbering"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCX75O7YkYIW3Kg2Wh997fIYUJAuqC9XYLyhs8WDk_ccfQ1sA1X9l1H1hW5N8Fhi_yLPv5ydK4UvRWMDv4O1-3SDUJ8xhfuBBcF2pMUNZ1wgVWu8zaGVf5pNJl6Bb6A4q28oRcCtJ9WaEJBd9-iS4w0j0fjLpnMs4_oYO3PZvnBspJQVjGA79dajix-HLVNJyEtp4ucOQ7PwXljpQ6HktzuR71Of9sBgP7u8oiCMJVJwqrqmM7zN3cLQc34mTM6e6hZsclLQeFknl5m"
            rating={4.9}
            price="₦15,000"
            variant="horizontal"
          />
          <ArtisanCard
            id="eze-sons"
            name="Eze & Sons Bespoke"
            category="Tailoring"
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuC7h8D-a9Xq_j1y9Fm_J6z-z8R_I9U6T0A9i2LwE5UqW8P5d1j2_Y3V4G6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9"
            rating={5.0}
            price="₦85,000"
            variant="horizontal"
          />
        </div>
      </section> */}
    </div>
  );
}

// Disable static generation
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
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Skeleton */}
        <div className="h-96 w-full bg-surface-container rounded-[3rem] animate-pulse"></div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-container-low rounded-[2rem] overflow-hidden flex flex-col h-[480px] border border-surface-container animate-pulse">
              <div className="h-80 bg-surface-container-high w-full"></div>
              <div className="p-6 space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-7 w-3/4 bg-surface-container-high rounded-lg"></div>
                    <div className="h-4 w-24 bg-surface-container-high rounded-md"></div>
                  </div>
                  <div className="h-8 w-16 bg-surface-container-high rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-surface-container-high rounded-md"></div>
                  <div className="h-4 w-5/6 bg-surface-container-high rounded-md"></div>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-14 w-full bg-surface-container-high rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
