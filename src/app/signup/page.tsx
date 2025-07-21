"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMagicLink(true);
    // Handle magic link sending
    console.log("Magic link sent to:", email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <Calendar className="text-primary h-8 w-8" />
            <span className="text-2xl font-bold text-gray-900">BookMe</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-600">Start accepting bookings in minutes</p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardContent className="">
            {!showMagicLink ? (
              <div className="space-y-6">
                {/* Google Sign-in - Primary CTA */}
                <Button
                  className="h-12 w-full border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
                  onClick={() =>
                    signIn("google", { callbackUrl: "/onboarding" })
                  }
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Magic Link Form */}
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="h-12 border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="bg-primary h-12 w-full hover:bg-purple-700"
                  >
                    Send magic link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-500 underline hover:text-gray-700"
                    onClick={() => {
                      /* Show email/password form */
                    }}
                  >
                    Or sign up with email and password
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Mail className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Check your email
                </h3>
                <p className="text-gray-600">
                  We sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Click the link in the email to sign in. The link will expire
                  in 10 minutes.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowMagicLink(false)}
                  className="border-gray-300"
                >
                  Back to sign up
                </Button>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:text-purple-700"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-gray-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
