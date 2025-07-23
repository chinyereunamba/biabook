"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar } from "lucide-react";

export function BookingNavigation() {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h2 className="mb-4 text-lg font-semibold">Manage Your Bookings</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col space-y-2">
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-blue-100 p-1">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Find Your Booking</h3>
                <p className="text-sm text-gray-600">
                  Look up your booking using your confirmation number
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/booking/lookup">Find Booking</Link>
            </Button>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-start space-x-3">
              <div className="mt-1 rounded-full bg-green-100 p-1">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Book New Appointment</h3>
                <p className="text-sm text-gray-600">
                  Schedule a new appointment with one of our businesses
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/">Browse Businesses</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
