"use client";

import { appConfig } from "@/utils/config";

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-primary-foreground font-bold">B</span>
              </div>
              <span className="font-bold">{appConfig.name}</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              The easiest way for businesses to manage appointments and get
              WhatsApp notifications.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className="text-primary-foreground/70 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="text-primary-foreground/70 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="text-primary-foreground/70 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-primary-foreground/20 text-primary-foreground/70 border-t pt-8 text-center text-sm">
          <p>&copy; 2025 {appConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
