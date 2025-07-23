"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export function BookingRescheduledNotification() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the URL has the rescheduled parameter
    if (searchParams.get("rescheduled") === "true") {
      setShow(true);

      // Hide the notification after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <Alert className="mb-6 bg-green-50 text-green-800">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Booking Rescheduled</AlertTitle>
      <AlertDescription>
        Your booking has been successfully rescheduled. You will receive a
        confirmation email shortly.
      </AlertDescription>
    </Alert>
  );
}
