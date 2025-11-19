import { GalleryVerticalEnd } from "lucide-react";
import { Suspense } from "react";

import { Verify } from "@/components/verify";
import Link from "next/link";

export default function CheckInboxPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xs flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          BiaBook
        </Link>
        <Suspense fallback={<div>Loading...</div>}>
          <Verify />
        </Suspense>
      </div>
    </div>
  );
}
