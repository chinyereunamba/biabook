"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form schema
const lookupSchema = z.object({
  confirmationNumber: z
    .string()
    .min(6, "Confirmation number must be at least 6 characters")
    .max(20, "Confirmation number must be at most 20 characters"),
});

type LookupFormValues = z.infer<typeof lookupSchema>;

export function BookingLookupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<LookupFormValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      confirmationNumber: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LookupFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      // Call the API to look up the booking
      const response = await fetch(
        `/api/bookings/lookup?confirmationNumber=${encodeURIComponent(
          data.confirmationNumber,
        )}`,
      );

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message ?? "Failed to find booking");
      }

      const booking = (await response.json()) as { id: string };

      // Redirect to the booking details page
      router.push(`/booking/${booking.id}`);
    } catch (err) {
      console.error("Error looking up booking:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Booking not found. Please check your confirmation number.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="confirmationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmation Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your confirmation number"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Booking
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Can&apos;t find your confirmation number? Check your email inbox for
            your booking confirmation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
