"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [businessSlug, setBusinessSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Get the business slug from localStorage (set during onboarding)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const slug = localStorage.getItem("businessSlug");
        if (slug) {
          setBusinessSlug(slug);
        } else {
          // If no slug in localStorage, generate a fallback
          if (session?.user?.name) {
            const fallbackSlug = session.user.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            setBusinessSlug(fallbackSlug);
          }
        }
      }
    } catch (error) {
      // Fallback if localStorage is not available
      if (session?.user?.name) {
        const fallbackSlug = session.user.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        setBusinessSlug(fallbackSlug);
      }
    }
  }, [session?.user?.name]);

  const handleCopyLink = () => {
    const bookingUrl = `${origin}/book/${businessSlug}`;
    void navigator.clipboard.writeText(bookingUrl);
    toast.success("Booking link copied to clipboard!");
  };

  const handleGoToDashboard = () => {
    setIsLoading(true);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <Calendar className="text-primary h-8 w-8" />
            <span className="text-2xl font-bold text-gray-900">BiaBook</span>
          </div>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              You&apos;re all set!
            </h2>
            <p className="mb-8 text-xl text-gray-600">
              Your booking page is ready. Start sharing it with your customers!
            </p>

            <div className="mb-8 rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 font-semibold text-gray-900">
                Your booking page URL:
              </h3>
              <div className="flex items-center justify-center space-x-2 rounded-md border border-gray-200 bg-white p-3">
                <span className="font-mono text-purple-600">
                  {origin}/book/{businessSlug}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300 bg-transparent"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-8 grid gap-4 text-left md:grid-cols-2">
              <div className="rounded-lg bg-purple-50 p-4">
                <h4 className="mb-2 font-semibold text-purple-900">
                  ✨ What&apos;s next?
                </h4>
                <ul className="space-y-1 text-sm text-purple-700">
                  <li>• Share your booking link</li>
                  <li>• Enable WhatsApp notifications</li>
                  <li>• Customize your page</li>
                </ul>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">📱 Pro tip</h4>
                <p className="text-sm text-blue-700">
                  Add your booking link to your social media bio and business
                  cards for easy access!
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                className="border-gray-300 bg-transparent"
                onClick={() => {
                  const bookingUrl = `${origin}/book/${businessSlug}`;
                  if (navigator.share) {
                    navigator
                      .share({
                        title: "Book an appointment with me",
                        text: "Book an appointment with me on BiaBook",
                        url: bookingUrl,
                      })
                      .catch(() => {
                        // Silently handle share API errors
                      });
                  } else {
                    handleCopyLink();
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share booking link
              </Button>

              <Button
                onClick={handleGoToDashboard}
                className="bg-primary hover:bg-purple-700"
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
                  "Go to dashboard"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
