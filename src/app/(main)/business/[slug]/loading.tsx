import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessLoading() {
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Hero Section Skeleton */}
      <div className="relative">
        {/* Cover Image Placeholder */}
        <div className="h-64 md:h-[400px] w-full bg-surface-container animate-pulse" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 md:-mt-24 relative z-10">
            {/* Profile Image Skeleton */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-56 md:h-56 rounded-[2.5rem] bg-surface-container-high border-8 border-background animate-pulse shadow-2xl" />
            </div>

            <div className="flex-1 pb-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-6 w-24 rounded-full" variant="shimmer" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 md:h-14 w-2/3 rounded-xl" variant="shimmer" />
                <Skeleton className="h-6 w-1/3 rounded-lg opacity-60" variant="shimmer" />
              </div>
            </div>

            <div className="pb-4 w-full md:w-auto">
              <Skeleton className="h-14 w-full md:w-40 rounded-full" variant="shimmer" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-20">
          <section className="space-y-8">
            <div className="flex justify-between items-end border-b border-surface-container-high pb-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 rounded-lg" variant="shimmer" />
                <Skeleton className="h-4 w-64 rounded-md" variant="shimmer" />
              </div>
            </div>

            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-8 rounded-[2rem] bg-surface-container-low border border-transparent space-y-6 flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-48 rounded-lg" variant="shimmer" />
                      <Skeleton className="h-5 w-16 rounded-full" variant="shimmer" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full rounded-md" variant="shimmer" />
                      <Skeleton className="h-4 w-3/4 rounded-md" variant="shimmer" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-20 rounded-md" variant="shimmer" />
                      <Skeleton className="h-4 w-24 rounded-md" variant="shimmer" />
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0 md:pl-8 flex flex-row md:flex-col items-center md:items-end w-full md:w-auto gap-4 border-t md:border-t-0 md:border-l border-surface-container-high pt-6 md:pt-0">
                    <div className="text-right space-y-1">
                      <Skeleton className="h-8 w-24 rounded-lg" variant="shimmer" />
                      <Skeleton className="h-3 w-16 rounded-sm ml-auto" variant="shimmer" />
                    </div>
                    <Skeleton className="h-12 w-32 rounded-full" variant="shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Gallery Skeleton */}
          <section className="space-y-8">
            <Skeleton className="h-8 w-48 rounded-lg" variant="shimmer" />
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className={`w-full rounded-3xl ${i % 2 === 0 ? 'h-64' : 'h-80'}`} variant="shimmer" />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="space-y-8">
          <div className="sticky top-24 p-8 rounded-[2.5rem] bg-surface-container-highest border border-surface-container space-y-6">
            <div className="p-4 bg-white/50 rounded-2xl flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" variant="shimmer" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 rounded-md" variant="shimmer" />
                <Skeleton className="h-3 w-1/2 rounded-md" variant="shimmer" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-full" variant="shimmer" />
            <div className="space-y-4 pt-4 border-t border-surface-container">
              <Skeleton className="h-3 w-24 rounded-sm" variant="shimmer" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" variant="shimmer" />
                    <Skeleton className="h-4 flex-1 rounded-md" variant="shimmer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
