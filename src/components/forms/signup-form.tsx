"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCredentialsSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          // businessName is currently not used by the API but kept for UI fidelity
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      router.push(`/signup/check-inbox?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Signup error:", error);
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleCredentialsSignup} className="space-y-6">
      <div className="space-y-5">
        {/* Full Name */}
        <div className="group">
          <label
            className="block text-xs font-bold uppercase tracking-widest text-primary mb-2 font-sans"
            htmlFor="full_name"
          >
            Full Name
          </label>
          <input
            className="w-full px-5 py-4 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 text-on-surface font-sans outline-none"
            id="full_name"
            name="full_name"
            placeholder="Chidi Adebayo"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Business Name */}
        <div className="group">
          <label
            className="block text-xs font-bold uppercase tracking-widest text-primary mb-2 font-sans"
            htmlFor="business_name"
          >
            Business Name
          </label>
          <input
            className="w-full px-5 py-4 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 text-on-surface font-sans outline-none"
            id="business_name"
            name="business_name"
            placeholder="Luxe Barber Studio"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        {/* Email Address */}
        <div className="group">
          <label
            className="block text-xs font-bold uppercase tracking-widest text-primary mb-2 font-sans"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            className="w-full px-5 py-4 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 text-on-surface font-sans outline-none"
            id="email"
            name="email"
            placeholder="hello@artisan.ng"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="group">
          <label
            className="block text-xs font-bold uppercase tracking-widest text-primary mb-2 font-sans"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="w-full px-5 py-4 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/50 text-on-surface font-sans outline-none"
            id="password"
            name="password"
            placeholder="••••••••••••"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-error font-sans font-medium">{error}</p>}

      <div className="pt-2">
        <button
          className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-primary/10 flex justify-center items-center gap-3 font-display disabled:opacity-70 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 py-4 px-6 bg-surface-container-low rounded-xl">
        <span className="material-symbols-outlined text-secondary">verified_user</span>
        <span className="text-sm font-medium text-on-surface-variant font-sans">
          No credit card required to get started
        </span>
      </div>
    </form>
  );
}
