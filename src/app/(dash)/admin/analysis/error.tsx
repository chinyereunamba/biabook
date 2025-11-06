"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin analytics page error:", error);
  }, [error]);

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
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-destructive">
              Failed to load analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6 text-sm">
              We encountered an error while loading the analytics data. This
              might be a temporary issue.
            </p>
            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh page
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="text-muted-foreground cursor-pointer text-xs">
                  Error details (dev only)
                </summary>
                <pre className="text-destructive mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                  {error.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
