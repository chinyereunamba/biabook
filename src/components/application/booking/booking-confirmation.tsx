import { Check, Calendar as CalendarIcon, Clock, MapPin, ExternalLink, Mail, Phone, Copy, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNotificationStatus } from "@/hooks/use-notification-status";

export interface BookingConfirmationData {
  id: string;
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: string;
  business: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    location?: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

interface BookingConfirmationProps {
  booking: BookingConfirmationData;
  onNewBooking?: () => void;
  className?: string;
}

export function BookingConfirmation({
  booking,
  onNewBooking,
  className = "",
}: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const { addNotification, updateNotificationStatus } = useNotificationStatus({
    appointmentId: booking.id,
  });

  useEffect(() => {
    const initialNotifications = [
      { id: `wa-${booking.id}`, type: "whatsapp" as const, status: "pending" as const, recipient: booking.business.phone || "Business" },
      { id: `em-${booking.id}`, type: "email" as const, status: "pending" as const, recipient: booking.customerEmail },
    ];
    initialNotifications.forEach(n => addNotification(n));

    setTimeout(() => {
      updateNotificationStatus(`wa-${booking.id}`, "sent");
      updateNotificationStatus(`em-${booking.id}`, "delivered");
    }, 2000);
  }, [booking.id, booking.business.phone, booking.customerEmail, addNotification, updateNotificationStatus]);

  const copyConfirmation = async () => {
    await navigator.clipboard.writeText(booking.confirmationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Confirmation code copied");
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    return new Date(0, 0, 0, parseInt(h ?? "0"), parseInt(m ?? "0")).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className={cn("max-w-4xl mx-auto py-12 px-6", className)}>
      <div className="text-center space-y-6 mb-16">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150 opacity-20" />
          <div className="w-24 h-24 bg-primary text-on-primary rounded-full flex items-center justify-center relative z-10 shadow-2xl">
            <Check className="w-12 h-12" strokeWidth={3} />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-display font-black text-primary leading-tight">Booking Confirmed</h1>
          <p className="text-on-surface-variant font-sans text-xl opacity-60">You're all set with {booking.business.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-3 space-y-8">
          {/* Main Details Card */}
          <div className="bg-surface-container-low p-10 rounded-[3rem] border border-surface-container shadow-sm space-y-10">
            <div className="flex items-center justify-between border-b border-surface-container pb-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block mb-2">Confirmation Code</span>
                <span className="text-3xl font-display font-bold text-primary tracking-tight">{booking.confirmationNumber}</span>
              </div>
              <button
                onClick={copyConfirmation}
                className="p-4 rounded-full bg-background hover:bg-surface-container icon-button transition-all text-primary border border-surface-container"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block mb-1">Date</span>
                    <span className="text-md font-bold text-primary">{formatDate(booking.appointmentDate)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block mb-1">Time</span>
                    <span className="text-md font-bold text-primary">{formatTime(booking.startTime)} — {formatTime(booking.endTime)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block mb-1">Location</span>
                    <span className="text-md font-bold text-primary">{booking.business.location || booking.business.name}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0 text-xl font-bold font-display">
                    ₦
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block mb-1">Total Paid</span>
                    <span className="text-md font-bold text-primary">₦{(booking.service.price / 100).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof / Sharing */}
          <div className="bg-primary text-on-primary p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl font-display font-bold">Share the love</h3>
              <p className="opacity-80 font-sans">Let your friends know about your upcoming appointment with {booking.business.name}.</p>
              <div className="flex gap-4">
                <button className="px-8 py-3 rounded-full bg-on-primary text-primary font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">Share Link</button>
                <button className="px-8 py-3 rounded-full bg-primary-container text-on-primary-container font-bold text-xs uppercase tracking-widest hover:bg-primary-container/80 transition-all">Tell a Friend</button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Notifications Status */}
          <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 mb-6">Notifications</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-primary">Email Confirmation</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
              </div>
              <div className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-primary">SMS Reminder</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-surface-container-highest" />
              </div>
            </div>
          </div>

          {/* Calendar Integration */}
          <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 mb-6">Save to Calendar</h4>
            <div className="space-y-3">
              <button className="w-full py-4 rounded-2xl bg-white hover:bg-background border border-surface-container text-primary font-bold text-xs uppercase tracking-widest transition-all text-center">Google Calendar</button>
              <button className="w-full py-4 rounded-2xl bg-white hover:bg-background border border-surface-container text-primary font-bold text-xs uppercase tracking-widest transition-all text-center">Apple / ICS</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            {onNewBooking && (
              <button
                onClick={onNewBooking}
                className="w-full py-5 rounded-full bg-primary text-on-primary font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Book Another
              </button>
            )}
            <Link
              href="/"
              className="w-full py-5 rounded-full bg-background border-2 border-primary/20 text-primary font-bold text-xs uppercase tracking-widest hover:border-primary transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Discover
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
