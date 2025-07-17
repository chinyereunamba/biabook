'use client'
import React, { useState } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialAvailability = days.map((day) => ({
  day,
  start: "09:00",
  end: "17:00",
}));

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState(initialAvailability);

  const updateTime = (index, field, value) => {
    setAvailability((avail) =>
      avail.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-xl rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Set Availability
        </h1>
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2">Day</th>
              <th className="p-2">Start</th>
              <th className="p-2">End</th>
            </tr>
          </thead>
          <tbody>
            {availability.map((a, i) => (
              <tr key={a.day}>
                <td className="p-2">{a.day}</td>
                <td className="p-2">
                  <input
                    type="time"
                    value={a.start}
                    onChange={(e) => updateTime(i, "start", e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="time"
                    value={a.end}
                    onChange={(e) => updateTime(i, "end", e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 font-semibold text-white shadow">
          Save Availability
        </button>
      </div>
    </main>
  );
}
