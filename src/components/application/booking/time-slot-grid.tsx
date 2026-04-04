import { Clock, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface TimeSlotGridProps {
  selectedDate?: string;
  selectedTime?: string;
  timeSlots: TimeSlot[];
  onTimeSelect: (startTime: string, endTime: string) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  businessTimezone?: string;
  businessName?: string;
}

export function TimeSlotGrid({
  selectedDate,
  selectedTime,
  timeSlots,
  onTimeSelect,
  loading = false,
  error = null,
  onRefresh,
  businessTimezone,
  businessName,
}: TimeSlotGridProps) {
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours ?? "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes ?? "00"} ${ampm}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  if (!selectedDate) {
    return (
      <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
          <Clock className="w-8 h-8 opacity-20" />
        </div>
        <h3 className="text-xl font-display font-bold text-primary mb-2">Awaiting Schedule</h3>
        <p className="text-on-surface-variant/60 font-sans text-sm max-w-[200px]">
          Please select a date on the calendar to reveal available times
        </p>
      </div>
    );
  }

  const availableSlots = timeSlots.filter((slot) => slot.available);

  return (
    <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-display font-bold text-primary">
            Available Times
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 mt-1">
            {formatDate(selectedDate)}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-3 rounded-full hover:bg-surface-container-high transition-colors text-primary border border-surface-container"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-error/5 border border-error/10 text-error text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-20" />
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-on-surface-variant/60 font-sans text-sm">No slots available for this date</p>
          <button
            onClick={onRefresh}
            className="mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
          >
            Check again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = selectedTime === slot.startTime;
            return (
              <button
                key={slot.startTime}
                onClick={() => onTimeSelect(slot.startTime, slot.endTime)}
                className={cn(
                  "py-4 rounded-2xl text-sm font-bold transition-all duration-300 font-sans",
                  isSelected
                    ? "bg-primary text-on-primary shadow-xl scale-[1.05] z-10"
                    : "bg-white text-primary border border-surface-container hover:border-primary/20 hover:bg-primary/5"
                )}
              >
                {formatTime(slot.startTime)}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-surface-container">
        <div className="flex items-center gap-3 text-on-surface-variant/60">
          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest">
            {businessTimezone ? `Times in ${businessTimezone.split('/').pop()?.replace('_', ' ')}` : "Local Timezone"}
          </div>
        </div>
      </div>
    </div>
  );
}
