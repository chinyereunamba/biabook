"use client";
import React, { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Separator } from "react-aria-components";

const steps = [
  { id: "01", name: "Account" },
  { id: "02", name: "Business Info" },
];

export default function SignupPage() {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      {/* <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Start your 30-day free trial.
          </p>
        </div>
        <Progress value={progress} className="mt-4" />
        <div>
          {step === 0 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" placeholder="Enter your business name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon">Salon</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your business"
                />
              </div>
            </div>
          )}
          
          
        </div>
        <div className="flex justify-between">
          {step > 0 ? (
            <Button variant="outline" onClick={prev}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button>Create account</Button>
          )}
        </div>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </div>
      </div> */}
      <section className="space-y-4">
        <h1 className="text-center text-2xl font-semibold">Sign up</h1>
        <div className="flex w-90 flex-col gap-3">
          <SocialButton
            social="google"
            theme="brand"
            className="border-none bg-white text-black"
          >
            Sign up with Google
          </SocialButton>
          <SocialButton social="apple" theme="brand">
            Sign up with Apple
          </SocialButton>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="hello@example.com" />
          <div>
            <Button className="bg-primary w-full">Sign up</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
