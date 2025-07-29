import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FormFeedback, ErrorFeedback } from "@/components/ui/feedback-states";
import { ErrorDisplay, useErrorHandler } from "@/components/base/error-display";
import { useApiErrorHandler } from "@/utils/error-transformation";
import { LoadingButton } from "@/components/ui/loading-states";
import {
  isValidTimeFormat,
  isEndTimeAfterStartTime,
} from "@/server/repositories/utils/availability-validation";

export interface DaySchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isAvailable: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface WeeklyScheduleProps {
  initialSchedule?: DaySchedule[];
  onSave?: (schedule: DaySchedule[]) => Promise<void>;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { name: "Monday", value: 1 },
  { name: "Tuesday", value: 2 },
  { name: "Wednesday", value: 3 },
  { name: "Thursday", value: 4 },
  { name: "Friday", value: 5 },
  { name: "Saturday", value: 6 },
  { name: "Sunday", value: 0 },
];

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:00";

export function WeeklySchedule({
  initialSchedule,
  onSave,
  isLoading = false,
}: WeeklyScheduleProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    if (initialSchedule && initialSchedule.length > 0) {
      return [...initialSchedule];
    }

    // Default schedule for all days
    return DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      isAvailable: true,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
    }));
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Error handling for API operations
  const { error: apiError, handleError, retry, clearError } = useErrorHandler();
  const { handleApiError } = useApiErrorHandler();

  // Update schedule when initialSchedule changes
  useEffect(() => {
    if (initialSchedule && initialSchedule.length > 0) {
      setSchedule([...initialSchedule]);
    }
  }, [initialSchedule]);

  const handleAvailabilityChange = (
    dayOfWeek: number,
    isAvailable: boolean,
  ) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, isAvailable } : day,
      ),
    );

    // Clear errors for this day
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${dayOfWeek}-start`];
      delete newErrors[`${dayOfWeek}-end`];
      delete newErrors[`${dayOfWeek}-range`];
      return newErrors;
    });
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day,
      ),
    );

    // Clear specific error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[
        `${dayOfWeek}-${field === "startTime" ? "start" : "end"}`
      ];
      delete newErrors[`${dayOfWeek}-range`];
      return newErrors;
    });
  };

  const validateSchedule = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    schedule.forEach((day) => {
      if (!day.isAvailable) return; // Skip validation for unavailable days

      if (!isValidTimeFormat(day.startTime)) {
        newErrors[`${day.dayOfWeek}-start`] = "Invalid start time format";
        isValid = false;
      }

      if (!isValidTimeFormat(day.endTime)) {
        newErrors[`${day.dayOfWeek}-end`] = "Invalid end time format";
        isValid = false;
      }

      if (
        isValidTimeFormat(day.startTime) &&
        isValidTimeFormat(day.endTime) &&
        !isEndTimeAfterStartTime(day.startTime, day.endTime)
      ) {
        newErrors[`${day.dayOfWeek}-range`] =
          "End time must be after start time";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateSchedule()) {
      toast.error("Please fix the errors in your schedule");
      return;
    }

    try {
      if (onSave) {
        await onSave(schedule);
        toast.success("Weekly schedule saved successfully");
        clearError(); // Clear any previous errors on success
      }
    } catch (error) {
      const errorInfo = handleApiError(error, {
        action: "save_schedule",
        schedule,
      });
      handleError(errorInfo);
      toast.error("Failed to save schedule. Please try again.");
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          Set your regular weekly availability for bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* API Error Display */}
        {apiError && (
          <ErrorDisplay
            error={apiError}
            onRetry={retry}
            onDismiss={clearError}
            variant="inline"
          />
        )}

        <FormFeedback errors={errors} />
        {DAYS_OF_WEEK.map(({ name, value }) => {
          const day = schedule.find((d) => d.dayOfWeek === value) ?? {
            dayOfWeek: value,
            isAvailable: true,
            startTime: DEFAULT_START_TIME,
            endTime: DEFAULT_END_TIME,
          };

          return (
            <div key={name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex w-full items-center gap-4">
                  <Switch
                    id={`switch-${name.toLowerCase()}`}
                    checked={day.isAvailable}
                    onCheckedChange={(checked) =>
                      handleAvailabilityChange(value, checked)
                    }
                  />
                  <Label
                    htmlFor={`switch-${name.toLowerCase()}`}
                    className="text-lg font-medium"
                  >
                    {name}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(e) =>
                        handleTimeChange(value, "startTime", e.target.value)
                      }
                      disabled={!day.isAvailable}
                      className={
                        errors[`${value}-start`] ? "border-red-500" : ""
                      }
                    />
                    {errors[`${value}-start`] && (
                      <span className="text-xs text-red-500">
                        {errors[`${value}-start`]}
                      </span>
                    )}
                  </div>
                  <span>-</span>
                  <div className="flex flex-col">
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(e) =>
                        handleTimeChange(value, "endTime", e.target.value)
                      }
                      disabled={!day.isAvailable}
                      className={errors[`${value}-end`] ? "border-red-500" : ""}
                    />
                    {errors[`${value}-end`] && (
                      <span className="text-xs text-red-500">
                        {errors[`${value}-end`]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {errors[`${value}-range`] && (
                <span className="ml-4 text-xs text-red-500">
                  {errors[`${value}-range`]}
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <LoadingButton loading={isLoading} loadingText="Saving...">
          Save Changes
        </LoadingButton>
      </CardFooter>
    </Card>
  );
}
