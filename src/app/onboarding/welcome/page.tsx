"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      if (session?.user) {
        try {
          // Check if user has already completed onboarding
          const response = await fetch("/api/user/onboarding-status");
          const data = await response.json();

          if (data.isOnboarded) {
            router.replace("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          // If there's an error, fall back to session check
          if (session.user.isOnboarded) {
            router.replace("/dashboard");
            return;
          }
        }
      }

      setIsCheckingOnboarding(false);
    };

    checkOnboardingStatus();
  }, [status, session, router]);

  // Show loading state while checking authentication and onboarding status
  if (status === "loading" || isCheckingOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleContinue = () => {
    setIsLoading(true);
    router.push("/onboarding");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <Calendar className="text-primary h-8 w-8" />
            <span className="text-2xl font-bold text-gray-900">BiaBook</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome to BiaBook, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Let&apos;s set up your booking system in just a few minutes
          </p>
        </div>

        <Card className="overflow-hidden border-gray-200 shadow-lg">
          <div className="grid md:grid-cols-2">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-white">
              <h2 className="mb-4 text-2xl font-bold">What you&apos;ll get</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-3 rounded-full bg-white/20 p-1">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Your own booking page</p>
                    <p className="text-sm text-white/80">
                      Customized for your business
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 rounded-full bg-white/20 p-1">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp notifications</p>
                    <p className="text-sm text-white/80">
                      Get instant alerts for new bookings
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 rounded-full bg-white/20 p-1">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Simple dashboard</p>
                    <p className="text-sm text-white/80">
                      Manage all your appointments in one place
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 rounded-full bg-white/20 p-1">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">60-second booking</p>
                    <p className="text-sm text-white/80">
                      Your customers can book in under a minute
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <CardContent className="flex flex-col justify-between p-8">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Setup takes just 3 steps
                </h2>
                <p className="mb-6 text-gray-600">
                  We&apos;ll guide you through the process
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Business details
                      </p>
                      <p className="text-sm text-gray-500">
                        Tell us about your business
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Services</p>
                      <p className="text-sm text-gray-500">
                        Add the services you offer
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Availability</p>
                      <p className="text-sm text-gray-500">
                        Set your working hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleContinue}
                  className="bg-primary w-full hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Let&apos;s get started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have everything set up?{" "}
          <a
            href="/dashboard"
            className="text-primary font-medium hover:text-purple-700"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
