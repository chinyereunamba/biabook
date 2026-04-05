import { notFound } from "next/navigation";
import { db } from "@/server/db";
import {
  businesses,
  services,
  weeklyAvailability,
  businessLocations,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { BusinessShowcaseClient } from "@/components/business/business-showcase-client";

interface BusinessPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getBusinessBySlug(slug: string) {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
    with: {
      services: {
        where: eq(services.isActive, true),
      },
      weeklyAvailability: true,
      location: true,
      category: true,
      gallery: {
        orderBy: (gallery, { asc }) => [asc(gallery.order)],
      },
      owner: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
  });

  return business;
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return <BusinessShowcaseClient business={business} />;
}
