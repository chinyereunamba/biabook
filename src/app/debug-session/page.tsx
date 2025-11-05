"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  performCompleteLogout,
  forceSessionRefresh,
} from "@/lib/session-utils";

export default function DebugSessionPage() {
  const { data: session, status, update } = useSession();

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">Session Debug Page</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status:</h2>
          <p>Status: {status}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Session Data:</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="space-x-4">
          <Button onClick={() => update()}>Refresh Session</Button>

          <Button onClick={forceSessionRefresh} variant="outline">
            Force Page Refresh
          </Button>

          <Button
            onClick={() => performCompleteLogout("/debug-session")}
            variant="destructive"
          >
            Complete Logout
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Local Storage:</h2>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                console.log("LocalStorage:", localStorage);
                console.log("SessionStorage:", sessionStorage);
              }
            }}
            variant="outline"
          >
            Log Storage to Console
          </Button>
        </div>
      </div>
    </div>
  );
}
