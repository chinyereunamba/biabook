import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - BookMe",
  description: "Set up your BookMe account",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
