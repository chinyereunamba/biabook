"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, RefreshCw, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckInboxPage() {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Add API call to resend verification email
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResent(true);
        setTimeout(() => setResent(false), 3000);
      }
    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setIsResending(false);
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
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Check your inbox
            </CardTitle>
            <p className="mt-2 text-gray-600">
              We've sent a verification link to{" "}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-medium text-gray-900">Next steps:</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                    1
                  </span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                    2
                  </span>
                  Click the verification link in the email
                </li>
                <li className="flex items-start">
                  <span className="mt-0.5 mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                    3
                  </span>
                  Complete your business setup
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || resent}
                variant="outline"
                className="h-12 w-full border-gray-200 hover:border-purple-300 hover:bg-purple-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resent ? (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Email sent!
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend verification email
                  </>
                )}
              </Button>

              <Link href="/signup" className="block">
                <Button
                  variant="ghost"
                  className="h-12 w-full text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to signup
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={handleResendEmail}
                  className="font-medium text-purple-600 underline hover:text-purple-700"
                  disabled={isResending}
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
