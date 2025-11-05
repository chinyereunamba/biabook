/**
 * Session management utilities
 */

import { signOut } from "next-auth/react";

/**
 * Clear all client-side session data and storage
 */
export function clearClientSession() {
  if (typeof window === "undefined") return;

  try {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear any NextAuth cookies manually (as backup)
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Clear NextAuth related cookies
      if (name.includes("next-auth") || name.includes("__Secure-next-auth")) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    }
  } catch (error) {
    console.warn("Failed to clear client session data:", error);
  }
}

/**
 * Perform a complete logout with session cleanup
 */
export async function performCompleteLogout(callbackUrl: string = "/") {
  // Clear client-side data first
  clearClientSession();

  // Then perform NextAuth signOut
  await signOut({
    callbackUrl,
    redirect: true,
  });
}

/**
 * Force refresh the current session
 */
export function forceSessionRefresh() {
  if (typeof window !== "undefined") {
    // Trigger a session refresh by reloading
    window.location.reload();
  }
}
