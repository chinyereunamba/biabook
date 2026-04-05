import { Star, MapPin, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessProfile } from "@/hooks/use-business";

interface BusinessProfileProps {
  business: BusinessProfile;
  showSharing?: boolean;
  showContact?: boolean;
  className?: string;
}

export function BusinessProfileComponent({
  business,
  className,
}: BusinessProfileProps) {
  return (
    <div className={cn("space-y-8 py-4", className)}>
      {/* Business Identity */}
      <div className="space-y-6">
        <div className="aspect-square w-24 rounded-[2rem] bg-surface-container-high border border-surface-container overflow-hidden relative group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
          {/* Business Image would go here */}
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-display font-black text-primary leading-tight tracking-tight">
            {business.name}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold font-sans">{business.rating || "5.0"}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
            <span className="text-sm text-on-surface-variant/60 font-sans">
              {business.reviews || 0} Reviews
            </span>
          </div>
        </div>

        <p className="text-on-surface-variant/70 font-sans leading-relaxed text-sm max-w-xs">
          {business.description || "A master artisan dedicated to their craft, providing premium services with unparalleled attention to detail."}
        </p>
      </div>

      {/* Quick Details */}
      <div className="space-y-4 pt-8 border-t border-surface-container">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Studio Details</h4>
        <div className="space-y-4">
          {business.location && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-primary py-1">{business.location}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-primary py-1">{business.phone}</span>
            </div>
          )}
          {business.email && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-primary py-1 truncate">{business.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
