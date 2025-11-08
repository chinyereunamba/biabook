"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-6 flex items-center justify-center space-x-2">
              <div className="rounded-xl p-2">
                <Calendar className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold text-transparent">
                BiaBook
              </span>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
              <p className="mt-2">
                We've sent password reset instructions to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-lg p-4">
                <h3 className="mb-2 font-medium">Next steps:</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mt-0.5 mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      1
                    </span>
                    Check your email inbox (and spam folder)
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      2
                    </span>
                    Click the reset password link in the email
                  </li>
                  <li className="flex items-start">
                    <span className="mt-0.5 mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      3
                    </span>
                    Create a new password for your account
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <Link href="/login" className="block">
                  <Button className="w-full">Back to Sign In</Button>
                </Link>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full text-center text-sm font-medium"
                >
                  Try a different email address
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                    }}
                    className="font-medium text-purple-600 underline hover:text-purple-700"
                  >
                    try again
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-gray-500">
            Need help?{" "}
            <Link
              href="/contact"
              className="underline transition-colors hover:text-gray-700"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <div className="rounded-xl p-2">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <span className="bg-clip-text text-2xl font-bold text-transparent">
              BiaBook
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Forgot your password?
          </h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-gray-700">
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
                className="h-12 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Sending reset link...
                  </div>
                ) : (
                  <>
                    Send reset link
                    <Mail className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="underline transition-colors hover:text-gray-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
