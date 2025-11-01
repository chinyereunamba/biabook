"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog(`Session status: ${status}`);

    if (status === "loading") {
      addLog("Session is loading...");
      return;
    }

    if (!session) {
      addLog("No session found");
      return;
    }

    addLog(`User email: ${session.user?.email}`);
    addLog(`User role: ${(session.user as any)?.role}`);
    addLog(`Is admin: ${(session.user as any)?.role === "admin"}`);
    addLog(`Target email: chinyereunamba15@gmail.com`);
    addLog(
      `Email match: ${session.user?.email === "chinyereunamba15@gmail.com"}`,
    );

    // Test admin redirect
    if ((session.user as any)?.role === "admin") {
      addLog("Admin user detected - should redirect to /admin");
      setTimeout(() => {
        addLog("Attempting redirect to /admin");
        router.push("/admin");
      }, 2000);
    } else {
      addLog("Regular user - no admin redirect needed");
    }
  }, [session, status, router]);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Redirect Test</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Session Info */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Session Information</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Status:</strong> {status}
            </p>
            <p>
              <strong>Has Session:</strong> {session ? "Yes" : "No"}
            </p>
            {session && (
              <>
                <p>
                  <strong>User ID:</strong> {session.user?.id}
                </p>
                <p>
                  <strong>Name:</strong> {session.user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {session.user?.email}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  {(session.user as any)?.role || "Not set"}
                </p>
                <p>
                  <strong>Is Admin:</strong>{" "}
                  {(session.user as any)?.role === "admin" ? "YES" : "NO"}
                </p>
                <p>
                  <strong>Is Onboarded:</strong>{" "}
                  {(session.user as any)?.isOnboarded ? "Yes" : "No"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="rounded-lg bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Test Actions</h2>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full rounded bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              Go to Login
            </Link>
            <Link
              href="/dashboard"
              className="block w-full rounded bg-green-500 px-4 py-2 text-center text-white hover:bg-green-600"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/admin"
              className="block w-full rounded bg-purple-500 px-4 py-2 text-center text-white hover:bg-purple-600"
            >
              Go to Admin
            </Link>
            <Link
              href="/debug-session"
              className="block w-full rounded bg-gray-500 px-4 py-2 text-center text-white hover:bg-gray-600"
            >
              Debug Session
            </Link>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="mt-8 rounded-lg bg-black p-4 font-mono text-sm text-green-400">
        <h3 className="mb-2 font-bold text-white">Debug Logs:</h3>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>

      {/* Raw Session Data */}
      <div className="mt-8 rounded-lg bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold">Raw Session Data:</h3>
        <pre className="overflow-auto rounded border bg-white p-2 text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
