import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6">
      <Link href="/" className="text-lg font-bold">
        BookMe
      </Link>
      <nav className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/#features">Features</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/booking">Booking</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </nav>
    </header>
  );
}