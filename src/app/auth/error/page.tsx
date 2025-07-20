"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";
  let errorDescription =
    "Please try again or contact support if the problem persists.";

  // Handle specific error cases
  switch (error) {
    case "Configuration":
      errorMessage = "Authentication Configuration Error";
      errorDescription =
        "There is an issue with the authentication configuration. Please check your environment variables.";
      break;
    case "AccessDenied":
      errorMessage = "Access Denied";
      errorDescription = "You do not have permission to sign in.";
      break;
    case "Verification":
      errorMessage = "Verification Error";
      errorDescription =
        "The verification link may have expired or already been used.";
      break;
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "EmailCreateAccount":
    case "Callback":
    case "OAuthAccountNotLinked":
    case "EmailSignin":
    case "CredentialsSignin":
    case "SessionRequired":
    default:
      // Use default error message
      break;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-lg font-medium">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-gray-600">{errorDescription}</p>
          <div className="flex flex-col space-y-3">
            <Button asChild>
              <Link href="/login">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
