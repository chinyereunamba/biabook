"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/base/error-toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gains focus
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ReactQueryProvider>
          <ErrorBoundary
            componentName="RootLayout"
            showReportButton={true}
            enableAutoReporting={true}
          >
            <ToastProvider>
              <Toaster position="top-right" richColors />
              <Analytics />
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </ReactQueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Avoid recreating the QueryClient on every render
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
