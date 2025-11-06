import { notFound } from "next/navigation";
import { db } from "@/server/db";
import {
  businesses,
  services,
  weeklyAvailability,
  businessLocations,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Calendar,
  DollarSign,
  Timer,
} from "lucide-react";
import Link from "next/link";

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
      owner: {
        columns: {
          name: true,
        },
      },
    },
  });

  return business;
}

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  // Group availability by day
  const availabilityByDay = business.weeklyAvailability.reduce(
    (acc, slot) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek]?.push(slot);
      return acc;
    },
    {} as Record<number, typeof business.weeklyAvailability>,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {business.name}
            </h1>
            {business.description && (
              <p className="mb-6 max-w-2xl text-xl text-purple-100">
                {business.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              {business.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {business.location.city}, {business.location.state}
                  </span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{business.phone}</span>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{business.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Services Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Our Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {business.services.length > 0 ? (
                  <div className="grid gap-4">
                    {business.services.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-lg font-semibold">
                            {service.name}
                          </h3>
                          <div className="text-right">
                            <div className="font-bold text-purple-600">
                              {formatPrice(service.price)}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Timer className="h-3 w-3" />
                              {formatDuration(service.duration)}
                            </div>
                          </div>
                        </div>
                        {service.description && (
                          <p className="mb-3 text-gray-600">
                            {service.description}
                          </p>
                        )}
                        {service.category && (
                          <Badge variant="secondary" className="mb-3">
                            {service.category}
                          </Badge>
                        )}
                        <Link
                          href={`/book/${business.slug}?service=${service.id}`}
                        >
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-gray-500">
                    No services available at the moment.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* About Section */}
            {business.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {business.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-gray-700">
                    {business.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Book CTA */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-6 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-purple-600" />
                <h3 className="mb-2 text-lg font-bold">Ready to book?</h3>
                <p className="mb-4 text-gray-600">
                  Choose a service and pick your preferred time
                </p>
                <Link href={`/book/${business.slug}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Book Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayNames.map((dayName, index) => {
                    const daySlots = availabilityByDay[index] || [];
                    const availableSlots = daySlots.filter(
                      (slot) => slot.isAvailable,
                    );

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="font-medium">{dayName}</span>
                        <span className="text-sm text-gray-600">
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot, slotIndex) => (
                              <span key={slotIndex}>
                                {slot.startTime} - {slot.endTime}
                                {slotIndex < availableSlots.length - 1 && ", "}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">Closed</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a
                      href={`tel:${business.phone}`}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {business.phone}
                    </a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a
                      href={`mailto:${business.email}`}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {business.email}
                    </a>
                  </div>
                )}
                {business.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                    <div className="text-sm">
                      <div>{business.location.address}</div>
                      <div>
                        {business.location.city}, {business.location.state}{" "}
                        {business.location.zipCode}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
