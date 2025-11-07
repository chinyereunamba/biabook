"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

export function ErrorDisplay() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>(
    "An authentication error occurred",
  );

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "Configuration") {
      setErrorMessage(
        "There was a problem with the authentication configuration. Please try again later.",
      );
    } else if (error === "AccessDenied") {
      setErrorMessage("Access denied. You do not have permission to sign in.");
    } else if (error === "Verification") {
      setErrorMessage(
        "The verification link has expired or has already been used.",
      );
    } else if (error) {
      setErrorMessage(`Authentication error: ${error}`);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold ">BiaBook</span>
          </div>
        </div>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full ">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="mt-4 text-center text-xl">
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 ">{errorMessage}</p>

            <div className="flex flex-col space-y-3">
              <Button asChild className="bg-primary hover:bg-purple-700">
                <Link href="/login">Try Again</Link>
              </Button>

              <Button asChild variant="outline" className="border-gray-300">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
