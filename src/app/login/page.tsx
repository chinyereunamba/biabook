import { signIn } from "@/server/auth";
import React from "react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Business Login
        </h1>
        <form className="space-y-4" action={async()=>await signIn('google')}>
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
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 py-2 font-semibold text-white shadow"
          >
            Login
          </button>
          <div className="mt-2 text-center text-sm text-gray-600">or</div>
          <button
                      type="submit"
            className="w-full rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 shadow"
          >
            Continue with Google
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </main>
  );
}
