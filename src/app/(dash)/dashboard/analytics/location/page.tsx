import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { businessRepository } from "@/server/repositories/business-repository";
import { LocationAnalyticsPage } from "@/components/application/analytics/location-analytics-page";

export default async function LocationAnalyticsPageRoute() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user's business
  const businesses = await businessRepository.findByOwnerId(session.user.id);

  if (businesses.length === 0) {
    redirect("/onboarding");
  }

  // For now, use the first business. In the future, this could support multiple businesses
  const business = businesses[0];

  if (!business) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto py-6">
      <LocationAnalyticsPage businessId={business.id} />
    </div>
  );
}
