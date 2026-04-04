"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
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
      <div className="w-full space-y-6">
        <div className="bg-surface-container-low p-8 rounded-2xl border border-border/10 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
            <span className="material-symbols-outlined text-secondary text-4xl">check_circle</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-primary">Check your email</h2>
          <p className="text-on-surface-variant font-sans">
            We've sent password reset instructions to{" "}
            <span className="font-bold text-primary">{email}</span>
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button variant="artisan" size="lg" className="w-full">
              Back to Sign In
            </Button>
          </Link>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
            className="w-full text-secondary font-bold hover:underline font-sans text-sm"
          >
            Try a different email address
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-sans">
          Email Address
        </label>
        <div className="relative">
          <input
            className="w-full bg-surface-container border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40 transition-all font-sans outline-none"
            placeholder="name@company.com"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
            mail
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-error font-sans font-medium">{error}</p>}

      <button
        className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-display disabled:opacity-70 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Sending link..." : "Reset Password"}
      </button>

      <div className="pt-4 text-center">
        <p className="text-xs text-on-surface-variant/60 font-sans">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="hover:text-secondary transition-colors underline">Terms</Link> and{" "}
          <Link href="/privacy" className="hover:text-secondary transition-colors underline">Privacy Policy</Link>.
        </p>
      </div>
    </form>
  );
}
