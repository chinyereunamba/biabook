import { Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessService } from "@/hooks/use-business";

interface ServiceCardProps {
  service: BusinessService;
  isSelected: boolean;
  onSelect: (serviceId: string) => void;
  className?: string;
}

export function ServiceCard({
  service,
  isSelected,
  onSelect,
  className,
}: ServiceCardProps) {
  const formatPrice = (cents: number): string => {
    return `₦${(cents / 100).toLocaleString()}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      onClick={() => onSelect(service.id)}
      className={cn(
        "group relative p-8 rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden border-2",
        isSelected
          ? "bg-surface-container-highest border-primary shadow-2xl scale-[1.02]"
          : "bg-surface-container-low border-transparent hover:border-surface-container-high hover:bg-surface-container",
        className,
      )}
    >
      {/* Background Accent */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150",
          isSelected && "bg-primary/10"
        )}
      />

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-display font-bold text-primary group-hover:text-primary/80 transition-colors">
                {service.name}
              </h3>
              {isSelected && (
                <div className="bg-primary text-on-primary p-1 rounded-full animate-in zoom-in-50 duration-300">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
              )}
            </div>
            {service.category && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 font-sans">
                {service.category}
              </span>
            )}
          </div>

          {service.description && (
            <p className="text-on-surface-variant text-md leading-relaxed font-sans max-w-xl opacity-80">
              {service.description}
            </p>
          )}

          <div className="flex items-center gap-6 text-on-surface-variant/70 font-sans text-sm font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(service.duration)}</span>
            </div>
            {service.bufferTime && service.bufferTime > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary/30" />
                <span>+{service.bufferTime}m gap</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end w-full md:w-auto gap-6 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-surface-container-high md:pl-8">
          <div className="flex-1 md:flex-none text-left md:text-right">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block mb-1">
              Investment
            </span>
            <span className="text-3xl font-display font-black text-primary">
              {formatPrice(service.price)}
            </span>
          </div>

          <button
            className={cn(
              "px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
              isSelected
                ? "bg-primary text-on-primary shadow-xl"
                : "bg-background text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5"
            )}
          >
            {isSelected ? "Selected" : "Select Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
