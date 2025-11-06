import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

interface OnboardingGuardProps {
  children: React.ReactNode;
  requireOnboarded?: boolean;
}

export default async function OnboardingGuard({
  children,
  requireOnboarded = true,
}: OnboardingGuardProps) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check onboarding status
  if (requireOnboarded && !session.user.isOnboarded) {
    redirect("/onboarding");
  }

  if (!requireOnboarded && session.user.isOnboarded) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
