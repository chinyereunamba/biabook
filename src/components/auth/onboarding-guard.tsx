import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { businessRepository } from "@/server/repositories/business-repository";

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
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  if (requireOnboarded && !session.user.isOnboarded) {
    // Check DB as fallback for stale session
    const businesses = await businessRepository.findByOwnerId(session.user.id!);
    if (businesses.length === 0) {
      redirect("/onboarding/welcome");
    }
  }

  return <>{children}</>;
}
