import type { Metadata } from "next";
import OnboardingGuard from "@/components/auth/onboarding-guard";

export const metadata: Metadata = {
  title: "Onboarding - BiaBook",
  description: "Set up your BiaBook account",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard requireOnboarded={false}>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </OnboardingGuard>
  );
}
