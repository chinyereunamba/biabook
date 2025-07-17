'use client'
import React, { useState } from "react";

const initialServices = [
  { id: 1, name: "Consultation", duration: "30 mins" },
  { id: 2, name: "Haircut", duration: "45 mins" },
];

export default function ServicesPage() {
  const [services, setServices] = useState(initialServices);
  const [newService, setNewService] = useState({ name: "", duration: "" });

  const addService = () => {
    setServices([...services, { ...newService, id: Date.now() }]);
    setNewService({ name: "", duration: "" });
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-xl rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Manage Services
        </h1>
        <ul className="mb-6 divide-y divide-gray-200">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2">
              <span>
                {s.name}{" "}
                <span className="text-xs text-gray-500">({s.duration})</span>
              </span>
              <button className="text-xs text-red-500 hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Service Name"
            value={newService.name}
            onChange={(e) =>
              setNewService((ns) => ({ ...ns, name: e.target.value }))
            }
            className="flex-1 rounded border border-gray-300 px-3 py-2"
          />
          <input
            type="text"
            placeholder="Duration"
            value={newService.duration}
            onChange={(e) =>
              setNewService((ns) => ({ ...ns, duration: e.target.value }))
            }
            className="w-32 rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          onClick={addService}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 font-semibold text-white shadow"
        >
          Add Service
        </button>
      </div>
    </main>
  );
}
