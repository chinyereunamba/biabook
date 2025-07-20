"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ButtonTest() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">Button Test</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Regular Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
          <Button size="lg">Large Button</Button>
          <Button size="icon" variant="outline">
            <ArrowRight />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button with Icon</h2>
        <div className="flex flex-wrap gap-4">
          <Button icon={<ArrowRight />}>Button with Icon</Button>
          <Button icon={<ArrowRight />} variant="secondary">
            Button with Icon
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading Button</Button>
          <Button loading variant="secondary">
            Loading Button
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Full Width Button</h2>
        <Button fullWidth>Full Width Button</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">AsChild Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="#">Link Button</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="#">Link Button Secondary</Link>
          </Button>
          <Button asChild loading>
            <Link href="#">Loading Link Button</Link>
          </Button>
          <Button asChild icon={<ArrowRight />}>
            <Link href="#">Link with Icon</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Disabled Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Button</Button>
          <Button disabled variant="secondary">
            Disabled Secondary
          </Button>
          <Button disabled asChild>
            <Link href="#">Disabled Link Button</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
