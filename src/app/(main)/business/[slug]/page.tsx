'use client'
import React, { useState } from "react";
import Image from "next/image";

const mockBusiness = {
  name: "Sample Salon",
  logo: "/favicon.ico",
  description: "A friendly place for all your beauty needs.",
  services: [
    { id: 1, name: "Haircut", duration: "45 mins" },
    { id: 2, name: "Consultation", duration: "30 mins" },
  ],
  availability: [
    { day: "Monday", start: "09:00", end: "17:00" },
    { day: "Tuesday", start: "09:00", end: "17:00" },
  ],
};

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

export default function BusinessBookingPage({ params }: { params: { slug: string } }) {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [confirmed, setConfirmed] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white/80 p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-4">
          <Image
            src={mockBusiness.logo}
            alt={mockBusiness.name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              {params.slug}
            </h1>
            <p className="text-sm text-gray-700">{mockBusiness.description}</p>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="mb-2 font-semibold text-blue-800">Services</h2>
          <div className="flex flex-wrap gap-2">
            {mockBusiness.services.map((s) => (
              <button
                key={s.id}
                className={`rounded border px-3 py-2 text-sm ${selectedService === s.id ? "border-blue-500 bg-blue-200" : "border-gray-200 bg-white hover:bg-blue-50"}`}
                onClick={() => setSelectedService(s.id)}
              >
                {s.name}{" "}
                <span className="text-xs text-gray-500">({s.duration})</span>
              </button>
            ))}
          </div>
        </div>
        {selectedService && (
          <div className="mb-4">
            <h2 className="mb-2 font-semibold text-blue-800">Pick a Time</h2>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  className={`rounded border px-2 py-1 text-xs ${selectedTime === slot ? "border-purple-500 bg-purple-200" : "border-gray-200 bg-white hover:bg-purple-50"}`}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedService && selectedTime && !confirmed && (
          <form className="mb-4" onSubmit={handleSubmit}>
            <h2 className="mb-2 font-semibold text-blue-800">Your Details</h2>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="mb-2 w-full rounded border border-gray-300 px-3 py-2"
              value={form.name}
              onChange={handleInput}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="mb-2 w-full rounded border border-gray-300 px-3 py-2"
              value={form.phone}
              onChange={handleInput}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="mb-2 w-full rounded border border-gray-300 px-3 py-2"
              value={form.email}
              onChange={handleInput}
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 font-semibold text-white shadow"
            >
              Book Appointment
            </button>
          </form>
        )}
        {confirmed && (
          <div className="py-8 text-center">
            <div className="mb-2 text-4xl">✅</div>
            <div className="mb-1 font-bold text-blue-800">
              Booking Confirmed!
            </div>
            <div className="text-sm text-gray-700">
              Thank you, {form.name}! Your booking is confirmed. The business
              will be notified on WhatsApp.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}