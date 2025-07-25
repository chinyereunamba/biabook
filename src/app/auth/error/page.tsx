import { Suspense } from "react";
import { ErrorDisplay } from "./error-display";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorDisplay />
    </Suspense>
  );
}