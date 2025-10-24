"use client";

import { Zap, Users, Calendar, BarChart3, Bell, Lock } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Instant Booking",
      desc: "Customers book in seconds without creating accounts",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      desc: "Automated WhatsApp & email notifications",
    },
    {
      icon: Calendar,
      title: "Auto Scheduling",
      desc: "Set availability once, let customers pick slots",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "Track revenue, bookings, and customer insights",
    },
    {
      icon: Users,
      title: "Team Management",
      desc: "Manage multiple staff and their schedules",
    },
    {
      icon: Lock,
      title: "Secure & Reliable",
      desc: "Enterprise-grade security for your data",
    },
  ];

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="text-foreground mb-6 text-5xl font-bold md:text-6xl">
            Powerful features
          </h2>
          <p className="text-foreground/70 mx-auto max-w-2xl text-xl">
            Everything you need to run your booking business efficiently
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group border-border bg-card hover:border-primary/50 hover:bg-secondary rounded-xl border p-8 transition-all duration-300"
              >
                <div className="bg-primary/20 group-hover:bg-primary/30 mb-6 flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                  <Icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-foreground mb-3 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-foreground/70">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
