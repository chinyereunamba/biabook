import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateToYYYYMMDD, getTodayDateString } from "@/lib/date-utils";

interface CalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  availableDates?: string[];
  minDate?: string;
  maxDate?: string;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  minDate,
  maxDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const { monthName, year, daysInMonth, firstDayOfMonth, today } =
    useMemo(() => {
      const monthName = currentMonth.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = currentMonth.getFullYear();
      const daysInMonth = new Date(
        year,
        currentMonth.getMonth() + 1,
        0,
      ).getDate();
      const firstDayOfMonth = new Date(
        year,
        currentMonth.getMonth(),
        1,
      ).getDay();
      const today = getTodayDateString();

      return { monthName, year, daysInMonth, firstDayOfMonth, today };
    }, [currentMonth]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatDateString = (day: number): string => {
    const date = new Date(year, currentMonth.getMonth(), day);
    return formatDateToYYYYMMDD(date);
  };

  const isDateAvailable = (dateStr: string): boolean => {
    return availableDates.includes(dateStr);
  };

  const isDateDisabled = (dateStr: string): boolean => {
    const todayStr = getTodayDateString();
    if (dateStr < todayStr) return true;
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 w-14" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(day);
      const isSelected = selectedDate === dateStr;
      const isAvailable = isDateAvailable(dateStr);
      const isDisabled = isDateDisabled(dateStr);
      const isToday = dateStr === today;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && onDateSelect(dateStr)}
          disabled={isDisabled}
          className={cn(
            "relative h-14 w-14 rounded-2xl text-sm transition-all duration-300 font-sans flex items-center justify-center",
            {
              "bg-primary text-on-primary shadow-xl scale-110 z-10": isSelected,
              "text-on-surface-variant/30 cursor-not-allowed": isDisabled,
              "hover:bg-surface-container-high": !isDisabled && !isSelected,
              "ring-2 ring-primary/20 ring-offset-2": isToday && !isSelected,
              "text-primary font-bold": isAvailable && !isSelected && !isDisabled,
              "text-on-surface": !isAvailable && !isSelected && !isDisabled,
            },
          )}
        >
          {day}
          {isAvailable && !isSelected && !isDisabled && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>,
      );
    }
    return days;
  };

  return (
    <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-xl font-display font-bold text-primary">
          {monthName} <span className="opacity-40">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-3 rounded-full hover:bg-surface-container-high transition-colors text-primary border border-surface-container"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-3 rounded-full hover:bg-surface-container-high transition-colors text-primary border border-surface-container"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40"
          >
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>

      <div className="mt-8 pt-8 border-t border-surface-container flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-surface-container-high" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Fully Booked</span>
        </div>
      </div>
    </div>
  );
}
