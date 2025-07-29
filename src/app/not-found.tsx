import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorFeedback } from "@/components/ui/feedback-states";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="max-w-md">
        <ErrorFeedback
          title="Page Not Found"
          message="Sorry, the page you are looking for does not exist."
          action={
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          }
        />
      </div>
    </main>
  );
}
