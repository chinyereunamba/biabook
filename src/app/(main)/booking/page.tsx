'use client'
import React, { useState } from "react";

const services = [
  { id: 1, name: "Haircut", icon: "💇‍♂️" },
  { id: 2, name: "Car Service", icon: "🚗" },
  { id: 3, name: "Tutoring", icon: "📚" },
  { id: 4, name: "Doctor Visit", icon: "🩺" },
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", whatsapp: "" });
  const [confirmed, setConfirmed] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Book an Appointment
        </h1>

        {/* Service Selection */}
        <div className="mb-6">
          <h2 className="mb-2 font-semibold text-blue-800">
            1. Choose a Service
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                className={`flex flex-col items-center rounded-lg border p-3 transition ${
                  selectedService === service.id
                    ? "border-blue-500 bg-blue-200"
                    : "border-gray-200 bg-white hover:bg-blue-50"
                }`}
                onClick={() => setSelectedService(service.id)}
                type="button"
              >
                <span className="mb-1 text-2xl">{service.icon}</span>
                <span className="text-sm">{service.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        {selectedService && (
          <div className="mb-6">
            <h2 className="mb-2 font-semibold text-blue-800">2. Pick a Time</h2>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  className={`rounded border px-2 py-1 text-xs transition ${
                    selectedTime === slot
                      ? "border-purple-500 bg-purple-200"
                      : "border-gray-200 bg-white hover:bg-purple-50"
                  }`}
                  onClick={() => setSelectedTime(slot)}
                  type="button"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Info Form */}
        {selectedService && selectedTime && !confirmed && (
          <form className="mb-4" onSubmit={handleSubmit}>
            <h2 className="mb-2 font-semibold text-blue-800">
              3. Your Details
            </h2>
            <div className="mb-3">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                value={form.name}
                onChange={handleInput}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="tel"
                name="whatsapp"
                placeholder="WhatsApp Number"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                value={form.whatsapp}
                onChange={handleInput}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 font-semibold text-white shadow transition hover:from-blue-600 hover:to-purple-600"
            >
              Confirm Booking
            </button>
          </form>
        )}

        {/* Confirmation */}
        {confirmed && (
          <div className="py-8 text-center">
            <div className="mb-2 text-4xl">✅</div>
            <div className="mb-1 font-bold text-blue-800">
              Booking Confirmed!
            </div>
            <div className="text-sm text-gray-700">
              Thank you, {form.name}! You’ll get a WhatsApp reminder for your{" "}
              {services.find((s) => s.id === selectedService)?.name} at{" "}
              {selectedTime}.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
