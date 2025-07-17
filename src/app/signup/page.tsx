"use client";
import { signIn } from "next-auth/react";
import React, { useState } from "react";

const steps = ["Sign Up", "Business Info", "Services", "Availability"];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  // Placeholder state for each step
  const [form, setForm] = useState({
    email: "",
    password: "",
    businessName: "",
    category: "",
    description: "",
    services: [{ name: "", duration: "" }],
    availability: [{ day: "Monday", start: "09:00", end: "17:00" }],
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Business Sign Up
        </h1>
        <div className="mb-4 flex justify-center gap-2">
          {steps.map((label, i) => (
            <div
              key={label}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${i === step ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              {label}
            </div>
          ))}
        </div>
        {step === 0 && (
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <button
              type="button"
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 font-semibold text-white shadow"
              onClick={next}
            >
              Continue
            </button>
            <div className="mt-2 text-center text-sm text-gray-600">or</div>
            <button
              type="button"
              onClick={async () => await signIn("google")}
              className="w-full rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 shadow"
            >
              Continue with Google
            </button>
          </form>
        )}
        {step === 1 && (
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Business Name"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="Category (e.g. Salon, Clinic)"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <textarea
              placeholder="Description"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <div className="flex justify-between">
              <button
                type="button"
                className="rounded bg-gray-200 px-4 py-2"
                onClick={prev}
              >
                Back
              </button>
              <button
                type="button"
                className="rounded bg-blue-500 px-4 py-2 text-white"
                onClick={next}
              >
                Continue
              </button>
            </div>
          </form>
        )}
        {step === 2 && (
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Service Name"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="Duration (e.g. 30 mins)"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <div className="flex justify-between">
              <button
                type="button"
                className="rounded bg-gray-200 px-4 py-2"
                onClick={prev}
              >
                Back
              </button>
              <button
                type="button"
                className="rounded bg-blue-500 px-4 py-2 text-white"
                onClick={next}
              >
                Continue
              </button>
            </div>
          </form>
        )}
        {step === 3 && (
          <form className="space-y-4">
            <select className="w-full rounded border border-gray-300 px-3 py-2">
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>
            <div className="flex gap-2">
              <input
                type="time"
                className="w-1/2 rounded border border-gray-300 px-3 py-2"
              />
              <input
                type="time"
                className="w-1/2 rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="rounded bg-gray-200 px-4 py-2"
                onClick={prev}
              >
                Back
              </button>
              <button
                type="button"
                className="rounded bg-green-500 px-4 py-2 text-white"
              >
                Finish
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
