import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <Skeleton className="mb-4 h-12 w-96 bg-purple-400/30" />
            <Skeleton className="mb-6 h-6 w-full max-w-2xl bg-purple-400/20" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-5 w-32 bg-purple-400/20" />
              <Skeleton className="h-5 w-40 bg-purple-400/20" />
              <Skeleton className="h-5 w-48 bg-purple-400/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Skeleton */}
          <div className="space-y-8 lg:col-span-2">
            {/* Services Section Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <Skeleton className="h-6 w-48" />
                        <div className="text-right">
                          <Skeleton className="mb-1 h-6 w-16" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                      <Skeleton className="mb-2 h-4 w-full" />
                      <Skeleton className="mb-3 h-4 w-3/4" />
                      <Skeleton className="mb-3 h-6 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About Section Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Quick Book CTA Skeleton */}
            <Card>
              <CardContent className="p-6 text-center">
                <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
                <Skeleton className="mx-auto mb-2 h-6 w-32" />
                <Skeleton className="mx-auto mb-4 h-4 w-48" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            {/* Business Hours Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1"
                    >
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
