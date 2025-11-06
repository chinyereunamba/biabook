"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Lock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMagicLink(true);
    // Handle magic link sending
    console.log("Magic link sent to:", email);
  };

  const handleCredentialsSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Register user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Failed to sign in after registration");
      }

      // Redirect to onboarding
      router.push("/onboarding");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-2">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
              BiaBook
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-600">Start accepting bookings in minutes</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            {!showMagicLink && !showPasswordForm ? (
              <div className="space-y-6">
                {/* Google Sign-in - Primary CTA */}
                <Button
                  className="h-12 w-full border border-gray-200 bg-white text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                  onClick={() =>
                    signIn("google", { callbackUrl: "/onboarding" })
                  }
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
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
                    <span className="bg-white px-4 font-medium text-gray-500">
                      Or
                    </span>
                  </div>
                </div>

                {/* Magic Link Form */}
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="font-medium text-gray-700"
                    >
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="h-12 border-gray-200 pl-10 transition-colors focus:border-purple-500 focus:ring-purple-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
                  >
                    Send magic link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Sign up with email and password instead
                  </button>
                </div>
              </div>
            ) : showPasswordForm ? (
              <div className="space-y-6">
                {/* Back button */}
                <button
                  type="button"
                  className="flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700"
                  onClick={() => setShowPasswordForm(false)}
                >
                  <ArrowRight className="mr-1 h-4 w-4 rotate-180" />
                  Back to options
                </button>

                {/* Error message */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-4 w-4 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-2">{error}</div>
                    </div>
                  </div>
                )}

                {/* Credentials Form */}
                <form onSubmit={handleCredentialsSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="h-12 border-gray-200 pl-10 transition-colors focus:border-purple-500 focus:ring-purple-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email-creds"
                      className="font-medium text-gray-700"
                    >
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="email-creds"
                        type="email"
                        placeholder="Enter your email address"
                        className="h-12 border-gray-200 pl-10 transition-colors focus:border-purple-500 focus:ring-purple-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="h-12 border-gray-200 pr-10 pl-10 transition-colors focus:border-purple-500 focus:ring-purple-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <div
                        className={`h-2 w-2 rounded-full ${password.length >= 8 ? "bg-green-400" : "bg-gray-300"}`}
                      ></div>
                      <span>At least 8 characters</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-200 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Creating account...
                      </div>
                    ) : (
                      <>
                        Create your account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Check your email
                  </h3>
                  <p className="text-gray-600">
                    We sent a magic link to{" "}
                    <span className="font-semibold text-gray-900">{email}</span>
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="mb-1 font-medium">What's next?</p>
                  <p>Click the link in the email to create your account.</p>
                  <p className="mt-2">
                    The link will expire in 10 minutes for security.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowMagicLink(false)}
                  className="h-12 border-gray-200"
                >
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Back to sign up
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-purple-600 transition-colors hover:text-purple-700"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          By signing up, you agree to our{" "}
          <Link
            href="/terms"
            className="underline transition-colors hover:text-gray-700"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline transition-colors hover:text-gray-700"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
