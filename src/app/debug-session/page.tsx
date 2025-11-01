"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8">Loading session...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Session Debug</h1>

      <div className="mb-6 rounded-lg bg-gray-100 p-4">
        <h2 className="mb-3 text-lg font-semibold">Session Status</h2>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Has Session:</strong> {session ? "Yes" : "No"}
        </p>
      </div>

      {session ? (
        <div className="mb-6 rounded-lg bg-green-50 p-4">
          <h2 className="mb-3 text-lg font-semibold">User Information</h2>
          <div className="space-y-2">
            <p>
              <strong>ID:</strong> {session.user?.id || "Not set"}
            </p>
            <p>
              <strong>Name:</strong> {session.user?.name || "Not set"}
            </p>
            <p>
              <strong>Email:</strong> {session.user?.email || "Not set"}
            </p>
            <p>
              <strong>Role:</strong> {(session.user as any)?.role || "Not set"}
            </p>
            <p>
              <strong>Is Admin:</strong>{" "}
              {(session.user as any)?.role === "admin" ? "YES" : "NO"}
            </p>
            <p>
              <strong>Is Onboarded:</strong>{" "}
              {(session.user as any)?.isOnboarded ? "Yes" : "No"}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <p>No session found. Please log in.</p>
        </div>
      )}

      <div className="space-x-4">
        <Link
          href="/login"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Dashboard
        </Link>
        <Link
          href="/admin"
          className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          Admin
        </Link>
      </div>

      <div className="mt-8 rounded-lg bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold">Raw Session Data:</h3>
        <pre className="overflow-auto text-sm">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
