"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function Verify({ ...props }: React.ComponentProps<typeof Card>) {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Add API call to resend verification email
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResent(true);
        setTimeout(() => setResent(false), 3000);
      }
    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setIsResending(false);
    }
  };
  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleResendEmail}>
          <FieldGroup>
            <FieldDescription className="text-center">
              We've sent a verification link to{" "}
              <span className="font-medium">{email}</span>
            </FieldDescription>

            <Button type="submit" disabled={isResending || resent}>
              Resend
            </Button>
          </FieldGroup>
        </form>
        <FieldDescription className="px-6 text-center">
          Need help?{" "}
          <Link
            href="/contact"
            className="underline transition-colors hover:text-gray-700"
          >
            Contact support
          </Link>
        </FieldDescription>
      </CardContent>
    </Card>
  );
}
