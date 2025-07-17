import React from "react";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "BookMe - Effortless Appointment Scheduling",
  description: "The easiest way for clients to book your services online.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
