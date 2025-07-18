"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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

const steps = [
  { id: "01", name: "Account" },
  { id: "02", name: "Business Info" },
  { id: "03", name: "Services" },
  { id: "04", name: "Availability" },
];

export default function SignupPage() {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
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
          {step === 2 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input id="serviceName" placeholder="e.g. Haircut" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" placeholder="e.g. 30 mins" />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Availability</Label>
                <div className="flex items-center gap-2">
                  <Select defaultValue="Monday">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="time" defaultValue="09:00" />
                  <Input type="time" defaultValue="17:00" />
                </div>
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
      </div>
    </main>
  );
}