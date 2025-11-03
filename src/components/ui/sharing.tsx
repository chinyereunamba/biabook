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
  MessageCircle,
  MapPin,
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

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText =
    text || `Check out ${businessName || "this business"} on BiaBook: ${url}`;

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
    <div className="border-border bg-card rounded-xl border p-6">
      <h3 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
        <Share2 className="text-primary h-5 w-5" />
        Share This Business
      </h3>

      <p className="text-foreground/70 mb-4 text-sm">
        Help others discover {businessName || "this business"} by sharing the
        booking link
      </p>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={shareViaWhatsApp}
        >
          <MessageSquare className="h-4 w-4" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={shareViaEmail}
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>

      <div className="bg-muted mt-4 rounded-lg p-3">
        <p className="text-foreground/60 text-xs break-all">{url}</p>
      </div>
    </div>
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
    <div className="border-border bg-card rounded-xl border p-6">
      <h3 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
        <Phone className="text-primary h-5 w-5" />
        Contact {businessName}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Phone className="text-foreground/50 h-4 w-4" />
            <span className="text-foreground text-sm">{businessPhone}</span>
          </div>
          <div className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={contactViaWhatsApp}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={contactViaPhone}>
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="text-foreground/50 h-4 w-4" />
          <span className="text-foreground text-sm">{businessEmail}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={contactViaEmail}
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="text-foreground/50 h-4 w-4" />
          <span className="text-foreground text-sm">{businessLocation}</span>
        </div>
      </div>
    </div>
  );
}
