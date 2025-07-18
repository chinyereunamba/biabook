'use client'
import React, { useState } from "react";

const mockBusinesses = [
  { id: 1, name: "Sample Salon", owner: "sarah@email.com", active: true },
  { id: 2, name: "Tutor Pro", owner: "mike@email.com", active: true },
  { id: 3, name: "Clinic One", owner: "anna@email.com", active: false },
];

export default function AdminPage() {
  const [businesses, setBusinesses] = useState(mockBusinesses);

  const toggleActive = (id: number) => {
    setBusinesses((bs) =>
      bs.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  };

  const deleteBusiness = (id: number) => {
    setBusinesses((bs) => bs.filter((b) => b.id !== id));
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Admin Panel
        </h1>
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2">Business</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-b last:border-0">
                <td className="p-2">{b.name}</td>
                <td className="p-2">{b.owner}</td>
                <td className="p-2">{b.active ? "Active" : "Disabled"}</td>
                <td className="flex gap-2 p-2">
                  <button
                    onClick={() => toggleActive(b.id)}
                    className={`rounded px-2 py-1 text-xs font-semibold ${b.active ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"}`}
                  >
                    {b.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteBusiness(b.id)}
                    className="rounded bg-red-200 px-2 py-1 text-xs font-semibold text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
