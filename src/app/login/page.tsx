"use client";
import { SocialButton } from "@/components/base/buttons/social-button";
import { signIn } from "next-auth/react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMagicLink(true);
    console.log("Magic link sent to:", email);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">BookMe</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardContent className="">
            {!showMagicLink ? (
              <div className="space-y-6">
                {/* Google Sign-in */}
                <div className="space-y-2">
                  <SocialButton
                    social="google"
                    theme="brand"
                    className="w-full border-none bg-white text-black"
                    onClick={async () => await signIn("google")}
                  >
                    Sign in with Google
                  </SocialButton>
                  <SocialButton social="apple" theme="brand" className="w-full">
                    Sign in with Apple
                  </SocialButton>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {!showPassword ? (
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
                      className="h-12 w-full bg-primary hover:bg-purple-700"
                    >
                      Send magic link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="h-12 border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-primary hover:text-purple-700"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full bg-primary hover:bg-purple-700"
                    >
                      Sign in
                    </Button>
                  </form>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-500 underline hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword
                      ? "Use magic link instead"
                      : "Sign in with password"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Mail className="h-8 w-8 text-primary" />
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
                  Back to sign in
                </Button>
              </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-purple-700"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    // <main className="flex min-h-screen items-center justify-center">
    //   <div className="flex w-90 flex-col gap-3">
    //
    //   </div>
    // </main>
  );
}
