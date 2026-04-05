import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function AvailabilityStep({
  availability,
  setAvailability,
}: {
  availability: any;
  setAvailability: (v: any) => void;
}) {
  return (
    <Card className="border-gray-200 shadow-lg">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
          <Calendar className="h-6 w-6 text-purple-600" />
        </div>
        <CardTitle className="text-2xl">Set your availability</CardTitle>
        <CardDescription>
          When are you available for appointments? You can adjust this anytime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries<any>(availability).map(([day, schedule]) => (
          <div
            key={day}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    [day]: { ...schedule, enabled: e.target.checked },
                  })
                }
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="w-20 font-medium capitalize">{day}</span>
            </div>

            {schedule.enabled && (
              <div className="flex items-center space-x-4">
                <select
                  value={schedule.start}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      [day]: { ...schedule, start: e.target.value },
                    })
                  }
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-purple-500 focus:ring-purple-500 bg-white"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0");
                    return (
                      <option key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
                <span>to</span>
                <select
                  value={schedule.end}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      [day]: { ...schedule, end: e.target.value },
                    })
                  }
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-purple-500 focus:ring-purple-500 bg-white"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0");
                    return (
                      <option key={`${hour}:00`} value={`${hour}:00`}>
                        {hour}:00
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
