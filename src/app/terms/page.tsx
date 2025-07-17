import React from "react";

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Terms of Service
        </h1>
        <p className="mb-4 text-gray-700">
          These are sample terms of service. By using this platform, you agree
          to our terms and conditions. Please use the service responsibly and
          respect the privacy of others.
        </p>
        <p className="mb-4 text-gray-700">
          For more details, please contact us at support@example.com.
        </p>
      </div>
    </main>
  );
}
