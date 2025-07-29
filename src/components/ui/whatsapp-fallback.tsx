"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  AlertTriangle,
  MessageSquare,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppFallbackProps {
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function WhatsAppFallbackComponent({
  businessName,
  businessPhone,
  businessEmail,
  error,
  onRetry,
  onDismiss,
  className = "",
}: WhatsAppFallbackProps) {
  const [copied, setCopied] = useState(false);

  const copyPhoneNumber = async () => {
    if (!businessPhone) return;

    try {
      await navigator.clipboard.writeText(businessPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Phone number copied to clipboard");
    } catch (err) {
      console.error("Failed to copy phone number:", err);
      toast.error("Failed to copy phone number");
    }
  };

  const callBusiness = () => {
    if (!businessPhone) return;
    window.open(`tel:${businessPhone}`, "_self");
    toast.success("Initiating phone call...");
  };

  const emailBusiness = () => {
    if (!businessEmail) return;

    const subject = encodeURIComponent(
      `Inquiry about booking with ${businessName}`,
    );
    const body = encodeURIComponent(
      `Hi ${businessName},\n\nI tried to contact you via WhatsApp but encountered an issue. I'd like to inquire about booking an appointment.\n\nThank you!`,
    );
    const emailUrl = `mailto:${businessEmail}?subject=${subject}&body=${body}`;

    window.open(emailUrl, "_blank");
    toast.success("Opening email client...");
  };

  return (
    <Card className={cn("border-red-200 bg-red-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-red-800">
          <AlertTriangle className="mr-2 h-5 w-5" />
          WhatsApp Connection Issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-red-200 bg-red-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>

        <p className="mb-4 text-sm text-red-700">
          We couldn't connect you to {businessName} via WhatsApp. Try these
          alternatives:
        </p>

        <div className="space-y-3">
          {/* Retry WhatsApp */}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-full border-green-300 text-green-700 hover:bg-green-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try WhatsApp Again
            </Button>
          )}

          {/* Alternative Contact Methods */}
          <div className="space-y-2">
            {businessPhone && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Call directly
                    </p>
                    <p className="text-sm text-gray-600">{businessPhone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPhoneNumber}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    {copied ? (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={callBusiness}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Phone className="mr-1 h-4 w-4" />
                    Call
                  </Button>
                </div>
              </div>
            )}

            {businessEmail && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Send email
                    </p>
                    <p className="text-sm text-gray-600">{businessEmail}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={emailBusiness}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Mail className="mr-1 h-4 w-4" />
                  Email
                </Button>
              </div>
            )}
          </div>

          {/* Manual WhatsApp Instructions */}
          {businessPhone && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <h4 className="mb-2 flex items-center text-sm font-medium text-yellow-800">
                <MessageSquare className="mr-2 h-4 w-4" />
                Manual WhatsApp Contact
              </h4>
              <p className="mb-2 text-xs text-yellow-700">
                You can also contact {businessName} manually via WhatsApp:
              </p>
              <ol className="ml-4 space-y-1 text-xs text-yellow-700">
                <li>1. Open WhatsApp on your device</li>
                <li>
                  2. Start a new chat with: <strong>{businessPhone}</strong>
                </li>
                <li>3. Send your booking inquiry</li>
              </ol>
            </div>
          )}

          {/* Dismiss Button */}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
