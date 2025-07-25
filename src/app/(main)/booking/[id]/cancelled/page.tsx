import {type Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Booking Cancelled | BookMe",
  description: "Your booking has been cancelled",
};

interface CancelledPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CancelledPage({ params }: CancelledPageProps) {
  // const { id } =  params;

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <CheckCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Booking Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your booking has been successfully cancelled
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="mb-6 text-center text-gray-600">
              You will receive a confirmation email shortly. If you need to make
              a new booking, you can do so from our website.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/booking/lookup">
                  <Calendar className="mr-2 h-4 w-4" />
                  Find Another Booking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
