import { Calendar } from "lucide-react";
import Link from "next/link";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">BiaBook</span>
            </Link>
            <Link
              href="/"
              className="font-medium text-purple-600 hover:text-purple-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>

          <div className="prose prose-gray max-w-none">
            <p className="mb-8 text-sm text-gray-600">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            {children}
          </div>
        </div>
      </main>

      {/* Footer with quick links */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-purple-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-purple-600">
                Terms of Service
              </Link>
              <Link href="/" className="hover:text-purple-600">
                Home
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 BiaBook. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
