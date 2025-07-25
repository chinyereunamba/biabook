"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-right" richColors />
      <Analytics />
      {children}
    </SessionProvider>
  );
}
