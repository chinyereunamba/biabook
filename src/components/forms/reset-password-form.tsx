"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Eye, EyeOff, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(
          "/login?message=Password reset successfully. Please sign in with your new password.",
        );
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Password Reset Successful!
              </CardTitle>
              <p className="mt-2 text-gray-600">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="mb-4 text-sm text-green-700">
                  Redirecting you to the sign in page in a few seconds...
                </p>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">
                  Invalid Reset Link
                </h2>
                <p className="mb-6 text-gray-600">
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </p>
                <Link href="/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Request New Reset Link
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Confirm Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Field>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </Field>
              <Button>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
