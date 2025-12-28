import { GalleryVerticalEnd } from "lucide-react";

import Link from "next/link";
import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";
import { Logo } from "@/utils/logo";

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo height={40} />
        </Link>
        <Suspense fallback={<div>Loading reset password…</div>}>
          <ResetPasswordClient />
        </Suspense>
      </div>
    </div>
  );
}
