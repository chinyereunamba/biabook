import { Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
}

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/api", label: "API" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help Center" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-neutral-900 text-white", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12">
          {/* Mobile-first stacked layout */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="text-primary size-6" />
                <span className="text-xl font-bold">BookMe</span>
              </div>
              <p className="max-w-sm text-base leading-relaxed text-neutral-300">
                The easiest way for businesses to manage appointments and get
                WhatsApp notifications.
              </p>
            </div>

            {/* Navigation sections */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-base font-semibold text-white">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-base leading-relaxed text-neutral-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-neutral-700 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-400">
              &copy; 2024 BookMe. All rights reserved.
            </p>

            {/* Additional links for mobile */}
            <div className="flex flex-wrap gap-6 text-sm">
              <Link
                href="/terms"
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
