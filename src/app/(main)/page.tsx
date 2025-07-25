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
  Search,
  Scissors,
  GraduationCap,
  Camera,
  Stethoscope,
  Dumbbell,
  Sparkles,
  CheckCircle,
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
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative flex w-full items-center justify-center overflow-hidden lg:min-h-180">
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
              <Button size="lg" asChild>
                <Link href="/signup" className="flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                icon={<Calendar className="mr-2 h-5 w-5" />}
              >
                Book Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Perfect for any service business
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of professionals already using BookMe
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-6">
            <Card className="rounded-xl border-gray-200 p-6 text-center transition-all duration-200 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                <Scissors className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Hair Salons</h3>
              <p className="text-sm text-gray-500">Cuts, colors, styling</p>
            </Card>

            <Card className="rounded-xl border-gray-200 p-6 text-center transition-all duration-200 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Tutors</h3>
              <p className="text-sm text-gray-500">Math, science, languages</p>
            </Card>

            <Card className="rounded-xl border-gray-200 p-6 text-center transition-all duration-200 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Photographers
              </h3>
              <p className="text-sm text-gray-500">
                Portraits, events, weddings
              </p>
            </Card>

            <Card className="rounded-xl border-gray-200 p-6 text-center transition-all duration-200 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <Stethoscope className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Doctors</h3>
              <p className="text-sm text-gray-500">Consultations, checkups</p>
            </Card>

            <Card className="rounded-xl border-gray-200 p-6 text-center transition-all duration-200 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                <Dumbbell className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Trainers</h3>
              <p className="text-sm text-gray-500">Personal fitness, yoga</p>
            </Card>

            <Card className="rounded-xl border-gray-200 p-6 text-center transition-all duration-200 hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Spas</h3>
              <p className="text-sm text-gray-500">Massage, wellness</p>
            </Card>
          </div>
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
                <CardContent className="">
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
                <CardContent className="">
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
                <CardContent className="">
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
                <CardContent className="">
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

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you grow
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="relative border-gray-200 p-8">
              <div className="text-center">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Starter
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-500">/forever</span>
                </div>
                <ul className="mb-8 space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">
                      Up to 50 bookings/month
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Basic booking page</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Email notifications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Customer management</span>
                  </li>
                </ul>
                <Button className="w-full bg-transparent" variant="outline">
                  Get started
                </Button>
              </div>
            </Card>

            <Card className="relative border-purple-200 p-8 shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                <Badge className="bg-primary px-4 py-1 text-white">
                  Most popular
                </Badge>
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$19</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="mb-8 space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Unlimited bookings</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">
                      WhatsApp notifications
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Custom booking page</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Analytics & reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Priority support</span>
                  </li>
                </ul>
                <Button className="bg-primary hover:bg-primary/90 w-full">
                  Start free trial
                </Button>
              </div>
            </Card>

            <Card className="relative border-gray-200 p-8">
              <div className="text-center">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Enterprise
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="mb-8 space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Multiple locations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Team management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">API access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">White-label options</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-600">Dedicated support</span>
                  </li>
                </ul>
                <Button className="w-full bg-transparent" variant="outline">
                  Contact sales
                </Button>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500">
              All plans include SSL security, 99.9% uptime, and
              mobile-responsive booking pages
            </p>
          </div>
        </div>
      </section>

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
              <Link href="/signup" className="flex items-center gap-2">
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
