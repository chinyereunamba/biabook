import { Calendar } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            Terms of Service
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="mb-8 text-sm text-gray-600">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4 text-gray-700">
                Welcome to BookMe. These Terms of Service ("Terms") govern your
                use of our appointment booking platform and related services
                ("Service") operated by BookMe ("us," "we," or "our").
              </p>
              <p className="text-gray-700">
                By accessing or using our Service, you agree to be bound by
                these Terms. If you disagree with any part of these terms, then
                you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                2. Description of Service
              </h2>
              <p className="mb-4 text-gray-700">
                BookMe is an online platform that connects customers with
                service businesses for appointment booking. Our Service
                includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Online appointment scheduling and management</li>
                <li>Business discovery and search functionality</li>
                <li>Payment processing for appointments</li>
                <li>Notification and reminder services</li>
                <li>Customer and business management tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                3. User Accounts
              </h2>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                3.1 Account Creation
              </h3>
              <p className="mb-4 text-gray-700">
                To use certain features of our Service, you may need to create
                an account. You agree to:
              </p>
              <ul className="mb-4 list-disc pl-6 text-gray-700">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your account credentials secure</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                3.2 Account Termination
              </h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account if you
                violate these Terms or engage in activities that harm our
                Service or other users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                4. Booking and Appointments
              </h2>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                4.1 Booking Process
              </h3>
              <ul className="mb-4 list-disc pl-6 text-gray-700">
                <li>
                  Appointments are subject to business availability and
                  confirmation
                </li>
                <li>You must provide accurate information when booking</li>
                <li>Booking confirmations are sent via email and/or SMS</li>
                <li>
                  You are responsible for attending scheduled appointments
                </li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                4.2 Cancellations and Rescheduling
              </h3>
              <ul className="mb-4 list-disc pl-6 text-gray-700">
                <li>Cancellation policies vary by business and service</li>
                <li>
                  Late cancellations may result in fees as determined by the
                  business
                </li>
                <li>Rescheduling is subject to availability</li>
                <li>No-shows may result in charges or booking restrictions</li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                4.3 Payment Terms
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  Payment is processed at the time of booking or service
                  completion
                </li>
                <li>All prices are set by individual businesses</li>
                <li>
                  Refunds are subject to business policies and applicable laws
                </li>
                <li>
                  BookMe may charge platform fees as disclosed during booking
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                5. Business Users
              </h2>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                5.1 Business Responsibilities
              </h3>
              <p className="mb-4 text-gray-700">
                If you operate a business on our platform, you agree to:
              </p>
              <ul className="mb-4 list-disc pl-6 text-gray-700">
                <li>Provide accurate business and service information</li>
                <li>Honor confirmed appointments</li>
                <li>Maintain professional standards of service</li>
                <li>Comply with applicable laws and regulations</li>
                <li>Handle customer data responsibly</li>
              </ul>

              <h3 className="mb-3 text-xl font-medium text-gray-900">
                5.2 Service Fees
              </h3>
              <p className="text-gray-700">
                Business users may be subject to platform fees, transaction
                fees, or subscription charges as outlined in separate business
                agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                6. Prohibited Uses
              </h2>
              <p className="mb-4 text-gray-700">You may not use our Service:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>For any unlawful purpose or to solicit unlawful acts</li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations or laws
                </li>
                <li>
                  To transmit or procure the sending of any advertising or
                  promotional material
                </li>
                <li>
                  To impersonate or attempt to impersonate another person or
                  entity
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
                <li>
                  To interfere with or circumvent security features of the
                  Service
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                7. Intellectual Property
              </h2>
              <p className="mb-4 text-gray-700">
                The Service and its original content, features, and
                functionality are and will remain the exclusive property of
                BookMe and its licensors. The Service is protected by copyright,
                trademark, and other laws.
              </p>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, create derivative
                works of, publicly display, publicly perform, republish,
                download, store, or transmit any of the material on our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                8. Privacy Policy
              </h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of the Service, to
                understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                9. Disclaimers
              </h2>
              <p className="mb-4 text-gray-700">
                The information on this Service is provided on an "as is" basis.
                To the fullest extent permitted by law, this Company:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>
                  Excludes all representations and warranties relating to this
                  Service and its contents
                </li>
                <li>
                  Does not guarantee the quality, safety, or legality of
                  services provided by businesses
                </li>
                <li>
                  Is not responsible for the conduct of businesses or customers
                  using the platform
                </li>
                <li>
                  Does not warrant that the Service will be uninterrupted or
                  error-free
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700">
                In no event shall BookMe, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                11. Indemnification
              </h2>
              <p className="text-gray-700">
                You agree to defend, indemnify, and hold harmless BookMe and its
                licensee and licensors, and their employees, contractors,
                agents, officers and directors, from and against any and all
                claims, damages, obligations, losses, liabilities, costs or
                debt, and expenses (including but not limited to attorney's
                fees).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                12. Termination
              </h2>
              <p className="text-gray-700">
                We may terminate or suspend your account and bar access to the
                Service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                13. Governing Law
              </h2>
              <p className="text-gray-700">
                These Terms shall be interpreted and governed by the laws of
                [Your Jurisdiction], without regard to its conflict of law
                provisions. Our failure to enforce any right or provision of
                these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                14. Changes to Terms
              </h2>
              <p className="text-gray-700">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will provide at least 30 days notice prior to any new terms
                taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                15. Contact Information
              </h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@bookme.com
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
