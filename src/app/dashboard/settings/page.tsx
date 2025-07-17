'use client'
import React, { useState } from "react";

export default function SettingsPage() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Settings
        </h1>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-semibold text-blue-800">
            WhatsApp Notifications
          </span>
          <button
            onClick={() => setWhatsappEnabled((v) => !v)}
            className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors duration-300 ${whatsappEnabled ? "bg-green-400" : "bg-gray-300"}`}
          >
            <span
              className={`h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${whatsappEnabled ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Receive WhatsApp notifications for new bookings.
        </div>
      </div>
    </main>
  );
}
