"use server";

import { signIn } from "@/server/auth";
import { redirect } from "next/navigation";

export async function signInCredential(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error: any) {
    console.error("Sign-in error:", error);

    // 👇 redirect back with a short error message
    if (error.type === "CredentialsSignin") {
      redirect("/login?error=invalid");
    }

    if (error.message === "Please verify your email before signing in") {
      redirect("/login?error=unverified");
    }

    redirect("/login?error=unknown");
  }
}
