"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WhatsAppFallbackComponent } from "@/components/ui/whatsapp-fallback";
import { toast } from "sonner";
import {
  Share2,
  MessageSquare,
  Copy,
  Mail,
  Phone,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SharingProps {
  title: string;
  url: string;
  text?: string;
  businessName?: string;
  businessPhone?: string;
  className?: string;
}

export function SharingComponent({
  title,
  url,
  text,
  businessName,
  businessPhone,
  className = "",
}: SharingProps) {
  const [copied, setCopied] = useState(false);

  const shareText =
    text || `Check out ${businessName || "this business"} on BookMe: ${url}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      `Book with ${businessName || "this business"}`,
    );
    const body = encodeURIComponent(shareText);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl, "_blank");
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to copy
      await copyToClipboard();
    }
  };

  return (
    <Card className={cn("border-green-200 bg-green-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-green-800">
          <Share2 className="mr-2 h-5 w-5" />
          Share This Business
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-green-700">
          Help others discover {businessName || "this business"} by sharing the
          booking link
        </p>

        <div className="space-y-3">
          {/* Quick Share Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareViaWhatsApp}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={shareViaEmail}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              {copied ? (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>

            {/* @ts-ignore */}
            {navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaNative}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Share2 className="mr-2 h-4 w-4" />
                More
              </Button>
            )}
          </div>

          {/* URL Display */}
          <div className="rounded-lg border border-green-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="mr-2 flex-1 truncate text-sm text-gray-600">
                {url}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ContactSharingProps {
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  businessLocation?: string;
  className?: string;
}

export function ContactSharingComponent({
  businessName,
  businessPhone,
  businessEmail,
  businessLocation,
  className = "",
}: ContactSharingProps) {
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const contactViaWhatsApp = () => {
    if (!businessPhone) {
      setWhatsappError("WhatsApp contact not available");
      toast.error("WhatsApp contact not available");
      return;
    }

    try {
      // Clean phone number (remove non-digits)
      const cleanPhone = businessPhone.replace(/\D/g, "");

      if (cleanPhone.length < 10) {
        throw new Error("Invalid phone number format");
      }

      const message = encodeURIComponent(
        `Hi ${businessName}, I'd like to inquire about booking an appointment.`,
      );
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

      window.open(whatsappUrl, "_blank");
      setWhatsappError(null);

      toast.success("Opening WhatsApp...", {
        description: "You'll be redirected to WhatsApp to contact the business",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to open WhatsApp";
      setWhatsappError(errorMessage);
      setShowFallback(true);
      toast.error("WhatsApp Error", {
        description: errorMessage,
      });
    }
  };

  const contactViaEmail = () => {
    if (!businessEmail) {
      toast.error("Email contact not available");
      return;
    }

    const subject = encodeURIComponent(
      `Inquiry about booking with ${businessName}`,
    );
    const body = encodeURIComponent(
      `Hi ${businessName},\n\nI'd like to inquire about booking an appointment.\n\nThank you!`,
    );
    const emailUrl = `mailto:${businessEmail}?subject=${subject}&body=${body}`;

    window.open(emailUrl, "_blank");
    toast.success("Opening email client...");
  };

  const contactViaPhone = () => {
    if (!businessPhone) {
      toast.error("Phone contact not available");
      return;
    }

    window.open(`tel:${businessPhone}`, "_self");
    toast.success("Initiating phone call...");
  };

  return (
    <Card className={cn("border-blue-200 bg-blue-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <Phone className="mr-2 h-5 w-5" />
          Contact {businessName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-blue-700">
          Get in touch with {businessName} directly
        </p>

        <div className="space-y-3">
          {/* Contact Methods */}
          <div className="space-y-2">
            {businessPhone && (
              <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{businessPhone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={contactViaWhatsApp}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={contactViaPhone}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Phone className="mr-1 h-4 w-4" />
                    Call
                  </Button>
                </div>
              </div>
            )}

            {businessEmail && (
              <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-white p-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{businessEmail}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={contactViaEmail}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Mail className="mr-1 h-4 w-4" />
                  Email
                </Button>
              </div>
            )}

            {businessLocation && (
              <div className="flex items-center space-x-3 rounded-lg border border-blue-200 bg-white p-3">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{businessLocation}</p>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Error Fallback */}
          {showFallback && whatsappError && (
            <WhatsAppFallbackComponent
              businessName={businessName}
              businessPhone={businessPhone}
              businessEmail={businessEmail}
              error={whatsappError}
              onRetry={() => {
                setWhatsappError(null);
                setShowFallback(false);
                contactViaWhatsApp();
              }}
              onDismiss={() => {
                setWhatsappError(null);
                setShowFallback(false);
              }}
              className="mt-3"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
