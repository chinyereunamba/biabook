import React from "react";

const mockBookings = [
  {
    id: 1,
    client: "Sarah Lee",
    service: "Haircut",
    time: "10:00 AM",
    date: "2024-06-10",
  },
  {
    id: 2,
    client: "Mike Brown",
    service: "Car Service",
    time: "01:00 PM",
    date: "2024-06-11",
  },
  {
    id: 3,
    client: "Anna Smith",
    service: "Tutoring",
    time: "03:00 PM",
    date: "2024-06-12",
  },
];

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Business Dashboard
        </h1>
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-100 p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">
              {mockBookings.length}
            </div>
            <div className="text-sm text-blue-800">Upcoming Bookings</div>
          </div>
          <div className="rounded-lg bg-purple-100 p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">3</div>
            <div className="text-sm text-purple-800">Services</div>
          </div>
        </div>
        <h2 className="mb-2 font-semibold text-blue-800">
          Upcoming Appointments
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2">Client</th>
                <th className="p-2">Service</th>
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="p-2">{b.client}</td>
                  <td className="p-2">{b.service}</td>
                  <td className="p-2">{b.date}</td>
                  <td className="p-2">{b.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
