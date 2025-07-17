import React from "react";

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white/80 p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-900">
          Privacy Policy
        </h1>
        <p className="mb-4 text-gray-700">
          This is a sample privacy policy. Your privacy is important to us. We
          only use your information to provide and improve our appointment
          scheduling service. We do not share your data with third parties
          except as required to deliver reminders or as required by law.
        </p>
        <p className="mb-4 text-gray-700">
          For more details, please contact us at support@example.com.
        </p>
      </div>
    </main>
  );
}
