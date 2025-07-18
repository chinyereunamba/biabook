import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  CreditCard,
  Users,
  Clock,
  BarChart,
  Settings,
  Check,
  Star,
  ArrowRight,
  Zap,
  MessageSquare,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users02 } from "@untitledui/icons/Users02";
import { TestimonialSimpleCentered01 } from "@/components/testimonials";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="lg:min-h-180 relative flex w-full items-center justify-center overflow-hidden">
        {/* Diagonal background */}

        <div className="relative z-10 container mx-auto flex flex-col-reverse items-center gap-8 px-4 md:flex-row md:gap-16 md:px-6">
          {/* Left: Content */}
          <div className="w-full space-y-6 py-16 text-left md:w-1/2">
            <h1 className="text-5xl leading-tight font-bold lg:text-6xl">
              Let customers book you in{" "}
              <span className="text-primary">60 seconds</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Get reminded on WhatsApp. For salons, tutors, clinics, and more.
              No complicated setup required.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                <Calendar className="mr-2 h-5 w-5" />
                Book Demo
              </Button>
            </div>
          </div>
          {/* Right: Image */}
          {/* <div className="flex w-full items-center justify-center py-8 md:w-1/2">
            <div className="border-primary relative overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Business owner at work"
                fill
                className="object-cover"
                priority
              />
              <div
                className="from-primary/30 to-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-tr"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 0% 100%)" }}
              />
            </div>
          </div> */}
        </div>
      </section>

      <section id="features" className="relative bg-slate-900 py-20 text-white">
        <div className="relative container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-2xl">
                  <Zap className="h-8 w-8" />
                </div>
                <h2 className="text-4xl font-bold">
                  Beautiful booking to grow smarter
                </h2>
                <p className="text-lg text-slate-300">
                  Powerful, self-serve appointment booking and WhatsApp
                  notifications to help you convert, engage, and retain more
                  customers.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:col-span-2">
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="bg-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    WhatsApp Reminders
                  </h3>
                  <p className="mb-4 text-slate-300">
                    Get instant notifications on WhatsApp when customers book
                    appointments. Never miss a booking again.
                  </p>
                  <Button variant="link" className="p-0 text-purple-400">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="bg-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Easy Booking
                  </h3>
                  <p className="mb-4 text-slate-300">
                    Customers can book instantly without creating accounts. Just
                    name, phone, and email required.
                  </p>
                  <Button variant="link" className="p-0 text-purple-400">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="bg-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                    <Users02 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Admin Dashboard
                  </h3>
                  <p className="mb-4 text-slate-300">
                    Manage all your bookings, services, and availability from
                    one beautiful dashboard.
                  </p>
                  <Button variant="link" className="p-0 text-purple-400">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="p-6">
                  <div className="bg-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Smart Scheduling
                  </h3>
                  <p className="mb-4 text-slate-300">
                    Set your availability once and let customers book available
                    time slots automatically.
                  </p>
                  <Button variant="link" className="p-0 text-purple-400">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Trusted by businesses everywhere
            </h2>
            <p className="text-muted-foreground text-xl">
              See how BookMe helps different types of businesses
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "BookMe transformed how my salon operates. WhatsApp
                  notifications keep me updated instantly, and my clients love
                  how easy it is to book."
                </p>
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-primary font-semibold">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Martinez</p>
                    <p className="text-muted-foreground text-sm">
                      Bella Hair Salon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "As a tutor, I needed something simple for students to book
                  sessions. BookMe was perfect - no complicated setup, just
                  works!"
                </p>
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-primbg-primary font-semibold">
                      DJ
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">David Johnson</p>
                    <p className="text-muted-foreground text-sm">Math Tutor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Our clinic saw 40% fewer no-shows after implementing BookMe.
                  The WhatsApp reminders make all the difference."
                </p>
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-primbg-primary font-semibold">
                      LC
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Lisa Chen</p>
                    <p className="text-muted-foreground text-sm">
                      Wellness Clinic
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
      <TestimonialSimpleCentered01 />

      {/* CTA Section */}
      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-xl text-purple-100">
            Join thousands of businesses using BookMe to manage their
            appointments
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hover:text-primary border-white bg-transparent text-white hover:bg-white"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
