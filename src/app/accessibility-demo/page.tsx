import { AccessibilityTest } from "@/components/accessibility/accessibility-test";
import { AccessibilityValidator } from "@/components/accessibility/accessibility-validator";

export default function AccessibilityDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header role="banner" className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              BookMe - Accessibility Demo
            </h1>
            <nav role="navigation" aria-label="Main navigation">
              <ul className="flex space-x-6">
                <li>
                  <a
                    href="#demo"
                    className="focus:ring-primary rounded px-2 py-1 text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    Demo
                  </a>
                </li>
                <li>
                  <a
                    href="#validator"
                    className="focus:ring-primary rounded px-2 py-1 text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  >
                    Validator
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        role="main"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="space-y-12">
          {/* Introduction */}
          <section aria-labelledby="intro-heading">
            <h2
              id="intro-heading"
              className="mb-4 text-3xl font-bold text-gray-900"
            >
              Accessibility Implementation Demo
            </h2>
            <p className="max-w-3xl text-lg text-gray-600">
              This page demonstrates the comprehensive accessibility features
              implemented in the BookMe mobile-first UI design system. All
              components follow WCAG 2.1 AA guidelines and include proper ARIA
              attributes, keyboard navigation, and screen reader support.
            </p>
          </section>

          {/* Interactive Demo Section */}
          <section id="demo" aria-labelledby="demo-heading">
            <h2
              id="demo-heading"
              className="mb-6 text-2xl font-bold text-gray-900"
            >
              Interactive Component Demo
            </h2>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <AccessibilityTest />
            </div>
          </section>

          {/* Accessibility Validator Section */}
          <section id="validator" aria-labelledby="validator-heading">
            <h2
              id="validator-heading"
              className="mb-6 text-2xl font-bold text-gray-900"
            >
              Accessibility Validator
            </h2>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <AccessibilityValidator
                targetSelector="main"
                showDetails={true}
              />
            </div>
          </section>

          {/* Implementation Details */}
          <section aria-labelledby="implementation-heading">
            <h2
              id="implementation-heading"
              className="mb-6 text-2xl font-bold text-gray-900"
            >
              Implementation Details
            </h2>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  ARIA Attributes & Keyboard Navigation
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Proper ARIA labels and roles for all interactive elements
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Keyboard navigation with Tab, Enter, Space, and Arrow keys
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Focus management for modals and drawer components
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Screen reader announcements for dynamic content
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Semantic HTML structure with proper headings
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  WCAG 2.1 AA Compliance
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Color contrast ratios meet 4.5:1 minimum standard
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Touch targets are minimum 44x44px for mobile
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Form validation with clear error messages
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Alternative text for images and icons
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    Consistent navigation and interaction patterns
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Testing Instructions */}
          <section aria-labelledby="testing-heading">
            <h2
              id="testing-heading"
              className="mb-6 text-2xl font-bold text-gray-900"
            >
              How to Test Accessibility
            </h2>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Manual Testing Steps
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium text-blue-900">
                    Keyboard Navigation
                  </h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
                    <li>
                      Use Tab key to navigate through interactive elements
                    </li>
                    <li>Use Shift+Tab to navigate backwards</li>
                    <li>Use Enter or Space to activate buttons</li>
                    <li>Use Arrow keys to navigate within grids and menus</li>
                    <li>Use Escape key to close dialogs and menus</li>
                  </ol>
                </div>

                <div>
                  <h4 className="mb-2 font-medium text-blue-900">
                    Screen Reader Testing
                  </h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
                    <li>Enable screen reader (NVDA, JAWS, or VoiceOver)</li>
                    <li>Navigate by headings using H key</li>
                    <li>Navigate by landmarks using D key</li>
                    <li>Test form completion and error handling</li>
                    <li>Verify announcements for dynamic content</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer role="contentinfo" className="mt-16 bg-gray-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">
              BookMe Accessibility Demo - WCAG 2.1 AA Compliant
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Built with comprehensive accessibility features for all users
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
