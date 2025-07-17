import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Users,
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

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Effortless Appointment Scheduling
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  BookMe is the all-in-one solution for businesses to manage
                  appointments, get paid, and grow their customer base.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full bg-muted py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything you need to run your business
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                BookMe provides a comprehensive suite of tools to help you
                manage your appointments, payments, and customers.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                <h3 className="text-xl font-bold">Appointment Scheduling</h3>
              </div>
              <p className="text-muted-foreground">
                Allow customers to book appointments online 24/7.
              </p>
            </div>
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                <h3 className="text-xl font-bold">Online Payments</h3>
              </div>
              <p className="text-muted-foreground">
                Accept payments securely through our platform.
              </p>
            </div>
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <h3 className="text-xl font-bold">Customer Management</h3>
              </div>
              <p className="text-muted-foreground">
                Keep track of your customers and their appointment history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              What our customers are saying
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from our satisfied customers who have transformed their
              businesses with BookMe.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/avatars/01.png" />
                    <AvatarFallback>SD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Sarah D.</CardTitle>
                    <CardDescription>Salon Owner</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;BookMe has been a game-changer for my salon. My
                  clients love the convenience of booking online, and I love
                  how easy it is to manage my schedule.&quot;
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/avatars/02.png" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Mike J.</CardTitle>
                    <CardDescription>Personal Trainer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;I was hesitant to switch to an online booking system,
                  but BookMe made it so simple. I&apos;m saving hours every
                  week on administrative tasks.&quot;
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/avatars/03.png" />
                    <AvatarFallback>LW</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Lisa W.</CardTitle>
                    <CardDescription>Music Teacher</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;My students and their parents love the automated
                  reminders. It has significantly reduced no-shows.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex w-full shrink-0 flex-col items-center justify-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BookMe. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link
            href="/terms"
            className="text-xs hover:underline"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-xs hover:underline"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </main>
  );
}
