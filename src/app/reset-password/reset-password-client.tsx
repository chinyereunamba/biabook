"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <ResetPasswordForm token={token} />;
}
