"use client";

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

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>
          Set your weekly availability for bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {days.map((day) => (
          <div key={day} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Switch id={`switch-${day.toLowerCase()}`} defaultChecked />
              <Label htmlFor={`switch-${day.toLowerCase()}`} className="text-lg font-medium">{day}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input type="time" defaultValue="09:00" />
              <span>-</span>
              <Input type="time" defaultValue="17:00" />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}