"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Search,
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  location: string;
  phone: string;
  email: string;
  services: string[];
  serviceCount: number;
  rating: number;
  reviews: number;
  priceRange: string;
}

export default function FindBusinessPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/businesses");

        if (!response.ok) {
          throw new Error("Failed to fetch businesses");
        }

        const data = await response.json();
        setBusinesses(data.businesses);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load businesses",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "salon", name: "Hair Salons" },
    { id: "education", name: "Tutoring" },
    { id: "healthcare", name: "Healthcare" },
    { id: "spa", name: "Spa & Wellness" },
    { id: "fitness", name: "Fitness" },
  ];

  const filteredBusinesses = businesses?.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ??
      business.description.toLowerCase().includes(searchTerm.toLowerCase()) ??
      business.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || business.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Find & Book Local Services
          </h1>
          <p className="mb-8 text-xl text-purple-100">
            Discover amazing businesses near you and book appointments instantly
          </p>

          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search for salons, tutors, clinics..."
                  className="h-12 bg-white pl-10 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                size="lg"
                className="bg-white px-8 text-purple-600 hover:bg-gray-100"
              >
                Search
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "secondary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    selectedCategory === category.id
                      ? "bg-white text-purple-600"
                      : "border-white text-white hover:bg-white hover:text-purple-600"
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {filteredBusinesses.length} businesses found
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <select className="rounded-md border px-3 py-1">
                <option>Rating</option>
                <option>Distance</option>
                <option>Price</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBusinesses.map((business) => (
              <Card
                key={business.id}
                className="overflow-hidden p-0 transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-video bg-gray-200">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                    <Calendar className="h-12 w-12 text-purple-400" />
                  </div>
                  <Badge className="absolute top-3 left-3 bg-white text-gray-800">
                    {business.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-xl font-semibold">{business.name}</h3>
                    <div className="flex items-center text-sm">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{business.rating}</span>
                      <span className="text-muted-foreground ml-1">
                        ({business.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="text-muted-foreground mb-3 flex items-center text-sm">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{business.location}</span>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {business.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {business.services.slice(0, 3).map((service: string) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                    {business.serviceCount > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{business.serviceCount - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Clock className="text-muted-foreground mr-1 h-4 w-4" />
                      <span className="font-medium">{business.priceRange}</span>
                    </div>
                    <Button asChild>
                      <Link href={`/book/${business.id}`}>
                        Book Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                No businesses found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or category filters
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Own a service business?</h2>
          <p className="text-muted-foreground mb-8 text-xl">
            Join BookMe and start accepting bookings with WhatsApp notifications
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
