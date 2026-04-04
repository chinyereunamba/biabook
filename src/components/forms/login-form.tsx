"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        email.includes("@biabook.app")
          ? router.push("/admin")
          : router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold text-on-surface mb-2">Welcome Back</h2>
        <p className="text-on-surface-variant font-sans">Access your artisan dashboard</p>
      </div>

      <form onSubmit={handleCredentialsSignIn} className="space-y-6">
        {/* Email Field */}
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
              alternate_email
            </span>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-sans">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-secondary hover:text-secondary-container transition-colors font-sans"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              className="w-full bg-surface-container border-none rounded-xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40 transition-all font-sans outline-none"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
              lock
            </span>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-3">
          <input
            className="w-5 h-5 rounded-lg border-none bg-surface-container text-secondary focus:ring-secondary/20 cursor-pointer accent-secondary"
            id="remember"
            type="checkbox"
          />
          <label htmlFor="remember" className="text-sm text-on-surface-variant font-medium cursor-pointer font-sans">
            Stay signed in
          </label>
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-error font-sans font-medium">{error}</p>}

        {/* Submit Button */}
        <button
          className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-display disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-10 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30"></div>
        </div>
        <span className="relative px-4 bg-background text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 font-sans">
          Or continue with
        </span>
      </div>

      {/* Social Login */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center space-x-3 bg-surface-container-highest text-on-surface py-4 rounded-xl hover:bg-surface-container-high transition-colors font-semibold font-sans border-none"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Google Account</span>
      </button>
    </div>
  );
}
