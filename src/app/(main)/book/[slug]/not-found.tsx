import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function BookingNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <div className="rounded-xl p-2">
              <Calendar className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold">
              BiaBook
            </span>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Booking Page Not Found
            </CardTitle>
            <p className="mt-2 text-gray-600">
              We couldn't find the booking page you're looking for.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="mb-4 text-sm text-gray-600">
                The business you're trying to book with may not exist or may
                have changed their booking settings.
              </p>

              <div className="space-y-3">
                <Link href="/browse" className="block">
                  <Button className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Find Businesses
                  </Button>
                </Link>

                <Link href="/" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
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
