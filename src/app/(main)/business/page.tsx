"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

export default function FindBusinessPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock business data
  const businesses = [
    {
      id: 1,
      name: "Bella Hair Salon",
      category: "Hair Salon",
      rating: 4.8,
      reviews: 124,
      address: "123 Main St, City, State",
      description:
        "Professional hair salon offering premium cuts, colors, and styling services.",
      services: ["Hair Cut", "Hair Color", "Styling"],
      priceRange: "$25 - $120",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "MindMath Tutoring",
      category: "Education",
      rating: 4.9,
      reviews: 67,
      address: "456 Oak Ave, City, State",
      description:
        "Expert math tutoring for students of all levels with personalized approach.",
      services: ["Algebra", "Calculus", "SAT Prep"],
      priceRange: "$50 - $75",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Wellness Clinic",
      category: "Healthcare",
      rating: 4.7,
      reviews: 89,
      address: "789 Pine Rd, City, State",
      description:
        "Comprehensive wellness and preventive care with experienced professionals.",
      services: ["Consultation", "Physical Therapy", "Wellness Checkup"],
      priceRange: "$80 - $120",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "Zen Spa & Wellness",
      category: "Spa",
      rating: 4.6,
      reviews: 156,
      address: "321 Elm St, City, State",
      description:
        "Relaxing spa treatments and wellness services in a tranquil environment.",
      services: ["Massage", "Facial", "Aromatherapy"],
      priceRange: "$60 - $150",
      image: "/placeholder.svg?height=200&width=300",
    },
  ];

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "salon", name: "Hair Salons" },
    { id: "education", name: "Tutoring" },
    { id: "healthcare", name: "Healthcare" },
    { id: "spa", name: "Spa & Wellness" },
    { id: "fitness", name: "Fitness" },
  ];

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      business.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

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
                className="overflow-hidden transition-shadow hover:shadow-lg p-0"
              >
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={business.image || "/placeholder.svg"}
                    alt={business.name}
                    className="h-full w-full object-cover"
                  />
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
                    <span>{business.address}</span>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {business.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {business.services.slice(0, 3).map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
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
