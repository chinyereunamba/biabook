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
      </ThemeProvider>
    </SessionProvider>
  );
}
