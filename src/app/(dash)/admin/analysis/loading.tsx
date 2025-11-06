import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export default function Loading() {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Deep dive into platform performance and trends
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Controls Loading */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Key Metrics Loading */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="mb-4 h-8 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Loading */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[350px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[350px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
