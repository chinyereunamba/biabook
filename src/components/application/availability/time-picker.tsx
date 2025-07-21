import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { isValidTimeFormat } from "@/server/repositories/utils/availability-validation";

export interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  minuteStep?: number;
  hourFormat?: 12 | 24;
  clearable?: boolean;
  error?: boolean;
}

export function TimePicker({
  value = "",
  onChange,
  disabled = false,
  className,
  placeholder = "Select time",
  minuteStep = 15,
  hourFormat = 24,
  clearable = false,
  error = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Parse the initial value
  useEffect(() => {
    if (value && isValidTimeFormat(value)) {
      const [hourStr, minuteStr] = value.split(":") || ["0", "0"];
      let hour = parseInt(hourStr || "0", 10);
      const minute = parseInt(minuteStr || "0", 10);
      if (hourFormat === 12) {
        const newPeriod = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        if (hour === 0) hour = 12;
        setPeriod(newPeriod);
      }

      setHours(hour);
      setMinutes(minute);
    }
  }, [value, hourFormat]);

  // Generate hours array based on format
  const hoursArray = Array.from(
    { length: hourFormat === 12 ? 12 : 24 },
    (_, i) => (hourFormat === 12 ? i + 1 : i)
  );

  // Generate minutes array based on step
  const minutesArray = Array.from(
    { length: 60 / minuteStep },
    (_, i) => i * minuteStep
  );

  const handleHourChange = (hour: number) => {
    setHours(hour);
    updateValue(hour, minutes);
  };

  const handleMinuteChange = (minute: number) => {
    setMinutes(minute);
    updateValue(hours, minute);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    updateValue(hours, minutes, newPeriod);
  };

  const updateValue = (hour: number, minute: number, newPeriod?: "AM" | "PM") => {
    if (onChange) {
      let adjustedHour = hour;

      if (hourFormat === 12) {
        const currentPeriod = newPeriod || period;
        if (currentPeriod === "PM" && hour < 12) {
          adjustedHour = hour + 12;
        } else if (currentPeriod === "AM" && hour === 12) {
          adjustedHour = 0;
        }
      }

      const formattedHour = adjustedHour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      onChange(`${formattedHour}:${formattedMinute}`);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange("");
    }
    setHours(0);
    setMinutes(0);
    setPeriod("AM");
  };

  const formatDisplayTime = (): string => {
    if (!value || !isValidTimeFormat(value)) {
      return placeholder;
    }

    const [hourStr, minuteStr] = value.split(":") || ["0", "0"];
    let hour = parseInt(hourStr || "0", 10);
    const minute = parseInt(minuteStr || "0", 10);

    if (hourFormat === 12) {
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${minuteStr} ${period}`;
    }

    return `${hourStr}:${minuteStr}`;
  };

  return (
    <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-2">Hour</span>
              <div className="grid grid-cols-4 gap-2">
                {hoursArray.map((hour) => (
                  <Button
                    key={hour}
                    variant={hours === hour ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleHourChange(hour)}
                    className="w-10 h-10"
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-2">Minute</span>
              <div className="grid grid-cols-4 gap-2">
                {minutesArray.map((minute) => (
                  <Button
                    key={minute}
                    variant={minutes === minute ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleMinuteChange(minute)}
                    className="w-10 h-10"
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {hourFormat === 12 && (
            <div className="flex gap-2">
              <Button
                variant={period === "AM" ? "primary" : "outline"}
                size="sm"
                onClick={() => handlePeriodChange("AM")}
                className="flex-1"
              >
                AM
              </Button>
              <Button
                variant={period === "PM" ? "primary" : "outline"}
                size="sm"
                onClick={() => handlePeriodChange("PM")}
                className="flex-1"
              >
                PM
              </Button>
            </div>
          )}

          <div className="flex justify-between">
            {clearable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="ml-auto"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}