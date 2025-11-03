import React from "react";

import { type Metadata } from "next";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

export const metadata: Metadata = {
  title: "BiaBook - Effortless Appointment Scheduling",
  description: "The easiest way for clients to book your services online.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
