import { useState } from "react";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  isValidTimeFormat,
  isEndTimeAfterStartTime,
  isValidDateFormat,
} from "@/server/repositories/utils/availability-validation";

export interface ExceptionDate {
  id?: string;
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  startTime?: string; // HH:MM format, null if closed all day
  endTime?: string; // HH:MM format, null if closed all day
  reason?: string;
}

export interface ExceptionDatesProps {
  exceptions: ExceptionDate[];
  onAddException?: (exception: Omit<ExceptionDate, "id">) => Promise<void>;
  onDeleteException?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function ExceptionDates({
  exceptions,
  onAddException,
  onDeleteException,
  isLoading = false,
}: ExceptionDatesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newException, setNewException] = useState<Omit<ExceptionDate, "id">>({
    date: "",
    isAvailable: false,
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof Omit<ExceptionDate, "id">,
    value: string | boolean,
  ) => {
    setNewException((prev) => ({ ...prev, [field]: value }));

    // Clear specific error
    if (field === "date") {
      setErrors((prev) => ({ ...prev, date: "" }));
    } else if (field === "startTime" || field === "endTime") {
      setErrors((prev) => ({ ...prev, [field]: "", timeRange: "" }));
    }
  };

  const validateException = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!isValidDateFormat(newException.date)) {
      newErrors.date = "Invalid date format. Use YYYY-MM-DD";
      isValid = false;
    }

    // Only validate times if the day is marked as available
    if (newException.isAvailable) {
      if (
        newException.startTime &&
        !isValidTimeFormat(newException.startTime)
      ) {
        newErrors.startTime = "Invalid start time format";
        isValid = false;
      }

      if (newException.endTime && !isValidTimeFormat(newException.endTime)) {
        newErrors.endTime = "Invalid end time format";
        isValid = false;
      }

      if (
        newException.startTime &&
        newException.endTime &&
        isValidTimeFormat(newException.startTime) &&
        isValidTimeFormat(newException.endTime) &&
        !isEndTimeAfterStartTime(newException.startTime, newException.endTime)
      ) {
        newErrors.timeRange = "End time must be after start time";
        isValid = false;
      }
    }

    // Check if exception already exists for this date
    const existingException = exceptions.find(
      (e) => e.date === newException.date,
    );
    if (existingException) {
      newErrors.date = "An exception already exists for this date";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddException = async () => {
    if (!validateException()) {
      return;
    }

    try {
      if (onAddException) {
        await onAddException(newException);
        toast.success("Exception added successfully");
        setIsDialogOpen(false);
        setNewException({
          date: "",
          isAvailable: false,
          startTime: "09:00",
          endTime: "17:00",
          reason: "",
        });
      }
    } catch (error) {
      console.error("Failed to add exception:", error);
      toast.error("Failed to add exception. Please try again.");
    }
  };

  const handleDeleteException = async (id: string) => {
    try {
      if (onDeleteException) {
        await onDeleteException(id);
        toast.success("Exception deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete exception:", error);
      toast.error("Failed to delete exception. Please try again.");
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Exception Dates</CardTitle>
          <CardDescription>
            Set special hours or closures for specific dates.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Exception</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exception Date</DialogTitle>
              <DialogDescription>
                Set special hours or mark a date as unavailable.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="exception-date">Date</Label>
                <Input
                  id="exception-date"
                  type="date"
                  value={newException.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <span className="text-xs text-red-500">{errors.date}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="exception-available"
                  checked={newException.isAvailable}
                  onCheckedChange={(checked) =>
                    handleInputChange("isAvailable", checked)
                  }
                />
                <Label htmlFor="exception-available">
                  {newException.isAvailable
                    ? "Available (special hours)"
                    : "Unavailable (closed)"}
                </Label>
              </div>

              {newException.isAvailable && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="exception-start-time">Start Time</Label>
                      <Input
                        id="exception-start-time"
                        type="time"
                        value={newException.startTime || ""}
                        onChange={(e) =>
                          handleInputChange("startTime", e.target.value)
                        }
                        className={errors.startTime ? "border-red-500" : ""}
                      />
                      {errors.startTime && (
                        <span className="text-xs text-red-500">
                          {errors.startTime}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="exception-end-time">End Time</Label>
                      <Input
                        id="exception-end-time"
                        type="time"
                        value={newException.endTime || ""}
                        onChange={(e) =>
                          handleInputChange("endTime", e.target.value)
                        }
                        className={errors.endTime ? "border-red-500" : ""}
                      />
                      {errors.endTime && (
                        <span className="text-xs text-red-500">
                          {errors.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                  {errors.timeRange && (
                    <span className="text-xs text-red-500">
                      {errors.timeRange}
                    </span>
                  )}
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="exception-reason">Reason (optional)</Label>
                <Input
                  id="exception-reason"
                  placeholder="e.g., Holiday, Vacation, etc."
                  value={newException.reason || ""}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddException} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Exception"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {exceptions.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No exception dates set. Add special hours or closures for holidays
            and other events.
          </div>
        ) : (
          <div className="space-y-4">
            {exceptions
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((exception) => (
                <div
                  key={exception.id || exception.date}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatDate(exception.date)}
                    </span>
                    <span
                      className={`text-sm ${exception.isAvailable ? "text-green-600" : "text-red-600"}`}
                    >
                      {exception.isAvailable
                        ? `Open: ${exception.startTime} - ${exception.endTime}`
                        : "Closed"}
                    </span>
                    {exception.reason && (
                      <span className="text-muted-foreground text-sm">
                        {exception.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      exception.id && handleDeleteException(exception.id)
                    }
                    disabled={isLoading || !exception.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
