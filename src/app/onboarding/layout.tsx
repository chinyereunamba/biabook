import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - BiaBook",
  description: "Set up your BiaBook account",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
