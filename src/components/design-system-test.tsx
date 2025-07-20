/**
 * Design System Test Component
 *
 * This component demonstrates the mobile-first design system implementation
 * and can be used to verify that all design tokens are working correctly.
 */

import React from "react";

export function DesignSystemTest() {
  return (
    <div className="ds-container">
      <div className="ds-stack">
        {/* Typography Test */}
        <section className="ds-card">
          <h1 className="ds-heading-1">Mobile-First Design System</h1>
          <h2 className="ds-heading-2">Typography Scale</h2>
          <h3 className="ds-heading-3">Responsive & Accessible</h3>
          <p className="ds-body-lg">
            This is large body text that demonstrates fluid typography scaling.
          </p>
          <p className="ds-body">
            This is regular body text optimized for mobile readability.
          </p>
          <p className="ds-body-sm">
            This is small body text for secondary information.
          </p>
          <p className="ds-caption">
            This is caption text for metadata and labels.
          </p>
        </section>

        {/* Button Test */}
        <section className="ds-card">
          <h3 className="ds-heading-3">Interactive Elements</h3>
          <div className="ds-inline">
            <button className="ds-button ds-button-primary">
              Primary Button
            </button>
            <button className="ds-button ds-button-secondary">
              Secondary Button
            </button>
          </div>
        </section>

        {/* Form Test */}
        <section className="ds-card">
          <h3 className="ds-heading-3">Form Elements</h3>
          <div className="ds-stack">
            <input
              className="ds-input"
              placeholder="Enter your name"
              type="text"
            />
            <input
              className="ds-input ds-input-error"
              placeholder="Error state input"
              type="email"
            />
            <p className="ds-error-text">This field is required</p>
            <input
              className="ds-input ds-input-success"
              placeholder="Success state input"
              type="tel"
            />
            <p className="ds-success-text">Valid phone number</p>
          </div>
        </section>

        {/* Grid Test */}
        <section className="ds-card">
          <h3 className="ds-heading-3">Responsive Grid</h3>
          <div className="ds-grid">
            <div className="ds-card ds-card-interactive">
              <h4 className="ds-heading-3">Card 1</h4>
              <p className="ds-body">Mobile-first responsive card</p>
            </div>
            <div className="ds-card ds-card-interactive">
              <h4 className="ds-heading-3">Card 2</h4>
              <p className="ds-body">Scales beautifully across devices</p>
            </div>
            <div className="ds-card ds-card-interactive">
              <h4 className="ds-heading-3">Card 3</h4>
              <p className="ds-body">Touch-friendly interactions</p>
            </div>
          </div>
        </section>

        {/* Color Test */}
        <section className="ds-card">
          <h3 className="ds-heading-3">Color System</h3>
          <div className="ds-grid">
            <div
              className="ds-card"
              style={{
                backgroundColor: "var(--ds-color-primary-500)",
                color: "white",
                minHeight: "var(--ds-touch-comfortable)",
              }}
            >
              <p className="ds-body">Primary Color</p>
            </div>
            <div
              className="ds-card"
              style={{
                backgroundColor: "var(--ds-color-success-500)",
                color: "white",
                minHeight: "var(--ds-touch-comfortable)",
              }}
            >
              <p className="ds-body">Success Color</p>
            </div>
            <div
              className="ds-card"
              style={{
                backgroundColor: "var(--ds-color-warning-500)",
                color: "white",
                minHeight: "var(--ds-touch-comfortable)",
              }}
            >
              <p className="ds-body">Warning Color</p>
            </div>
            <div
              className="ds-card"
              style={{
                backgroundColor: "var(--ds-color-error-500)",
                color: "white",
                minHeight: "var(--ds-touch-comfortable)",
              }}
            >
              <p className="ds-body">Error Color</p>
            </div>
          </div>
        </section>

        {/* Spacing Test */}
        <section className="ds-card">
          <h3 className="ds-heading-3">Spacing System</h3>
          <div className="ds-stack-sm">
            <div
              style={{
                padding: "var(--ds-space-2)",
                backgroundColor: "var(--ds-color-neutral-100)",
              }}
            >
              <p className="ds-body-sm">Space 2 (8px)</p>
            </div>
            <div
              style={{
                padding: "var(--ds-space-4)",
                backgroundColor: "var(--ds-color-neutral-200)",
              }}
            >
              <p className="ds-body-sm">Space 4 (16px)</p>
            </div>
            <div
              style={{
                padding: "var(--ds-space-6)",
                backgroundColor: "var(--ds-color-neutral-300)",
              }}
            >
              <p className="ds-body-sm">Space 6 (24px)</p>
            </div>
            <div
              style={{
                padding: "var(--ds-space-8)",
                backgroundColor: "var(--ds-color-neutral-400)",
              }}
            >
              <p className="ds-body-sm">Space 8 (32px)</p>
            </div>
          </div>
        </section>

        {/* Touch Target Test */}
        <section className="ds-card">
          <h3 className="ds-heading-3">Touch Targets</h3>
          <div className="ds-inline">
            <button
              className="ds-interactive"
              style={{
                backgroundColor: "var(--ds-color-primary-500)",
                color: "white",
                minHeight: "var(--ds-touch-min)",
              }}
            >
              Min (44px)
            </button>
            <button
              className="ds-interactive"
              style={{
                backgroundColor: "var(--ds-color-primary-600)",
                color: "white",
                minHeight: "var(--ds-touch-comfortable)",
              }}
            >
              Comfortable (48px)
            </button>
            <button
              className="ds-interactive"
              style={{
                backgroundColor: "var(--ds-color-primary-700)",
                color: "white",
                minHeight: "var(--ds-touch-large)",
              }}
            >
              Large (56px)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DesignSystemTest;
