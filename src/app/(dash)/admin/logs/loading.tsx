import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export default function Loading() {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">System Logs</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Monitor system activities and troubleshoot issues
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Stats Cards Loading */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Loading */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading logs...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
