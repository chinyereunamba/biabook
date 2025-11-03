import { Calendar } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Privacy Policy
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="mb-8 text-sm text-gray-600">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                1. Introduction
              </h2>
              <p className="mb-4 text-gray-700">
                Welcome to BiaBook ("we," "our," or "us"). This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our appointment booking platform and
                related services.
              </p>
              <p className="text-gray-700">
                By using BiaBook, you agree to the collection and use of
                information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                2. Information We Collect
              </h2>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                2.1 Personal Information
              </h3>
              <p className="mb-4 text-gray-700">
                When you book an appointment or create an account, we may
                collect:
              </p>
              <ul className="mb-4 list-disc pl-6 text-gray-700">
                <li>
                  Name and contact information (email address, phone number)
                </li>
                <li>Appointment details and preferences</li>
                <li>
                  Payment information (processed securely through third-party
                  providers)
                </li>
                <li>Communication history with businesses</li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                2.2 Business Information
              </h3>
              <p className="mb-4 text-gray-700">
                For business owners using our platform:
              </p>
              <ul className="mb-4 list-disc pl-6 text-gray-700">
                <li>Business name, address, and contact information</li>
                <li>Service offerings and pricing</li>
                <li>Availability schedules</li>
                <li>Customer appointment data</li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                2.3 Technical Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                3. How We Use Your Information
              </h2>
              <p className="mb-4 text-gray-700">
                We use the collected information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Facilitate appointment bookings and management</li>
                <li>Send booking confirmations, reminders, and updates</li>
                <li>Process payments and handle billing</li>
                <li>Provide customer support</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                4. Information Sharing
              </h2>
              <p className="mb-4 text-gray-700">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information in the following
                circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  <strong>With Businesses:</strong> Your booking information is
                  shared with the business you're booking with
                </li>
                <li>
                  <strong>Service Providers:</strong> Third-party services that
                  help us operate our platform (payment processors, email
                  services)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights and safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with
                  mergers, acquisitions, or asset sales
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                5. Data Security
              </h2>
              <p className="mb-4 text-gray-700">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="text-gray-700">
                However, no method of transmission over the internet or
                electronic storage is 100% secure. While we strive to protect
                your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                6. Your Rights
              </h2>
              <p className="mb-4 text-gray-700">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>
                  Data portability (receive your data in a structured format)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                7. Cookies and Tracking
              </h2>
              <p className="mb-4 text-gray-700">
                We use cookies and similar technologies to enhance your
                experience, analyze usage, and provide personalized content. You
                can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                8. Third-Party Links
              </h2>
              <p className="text-gray-700">
                Our platform may contain links to third-party websites. We are
                not responsible for the privacy practices of these external
                sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700">
                BiaBook is not intended for children under 13 years of age. We do
                not knowingly collect personal information from children under
                13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                11. Contact Us
              </h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@biabook.com
                  <br />
                  <strong>Address:</strong> [Your Business Address]
                  <br />
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
