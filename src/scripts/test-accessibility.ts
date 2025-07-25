/**
 * Accessibility testing script
 * Run this in the browser console to test accessibility compliance
 */

import {
  accessibilityTester,
  ScreenReaderTester,
} from "@/lib/accessibility-testing";

// Test all components on the current page
export function runAccessibilityTests() {
  console.log("🔍 Running accessibility tests...\n");

  const report = accessibilityTester.runFullTest();

  // Add screen reader tests
  const screenReaderResults = [
    ...ScreenReaderTester.testAnnouncements(document.body),
    ...ScreenReaderTester.testLandmarks(document.body),
  ];

  report.results.push(...screenReaderResults);

  // Recalculate summary
  const errors = report.results.filter((r) => r.severity === "error").length;
  const warnings = report.results.filter(
    (r) => r.severity === "warning",
  ).length;
  const passed = report.results.filter((r) => r.passed).length;

  report.summary = { errors, warnings, passed };
  report.passed = errors === 0;
  report.score =
    report.results.length > 0
      ? Math.round(((passed + warnings * 0.5) / report.results.length) * 100)
      : 100;

  // Log results
  console.log(`📊 Accessibility Score: ${report.score}%`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`⚠️  Warnings: ${report.summary.warnings}`);
  console.log(`❌ Errors: ${report.summary.errors}\n`);

  if (report.summary.errors > 0) {
    console.log("🚨 Critical Issues:");
    report.results
      .filter((r) => r.severity === "error")
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.message}`);
        console.log(`   Rule: ${result.rule}`);
        if (result.element) {
          console.log(`   Element:`, result.element);
        }
        console.log("");
      });
  }

  if (report.summary.warnings > 0) {
    console.log("⚠️  Warnings:");
    report.results
      .filter((r) => r.severity === "warning")
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.message}`);
        console.log(`   Rule: ${result.rule}`);
        console.log("");
      });
  }

  console.log("✨ Test completed!");
  return report;
}

// Test specific component
export function testComponent(selector: string) {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) {
    console.error(`Element not found: ${selector}`);
    return;
  }

  console.log(`🔍 Testing component: ${selector}\n`);

  const report = accessibilityTester.runFullTest(element);

  console.log(`📊 Component Score: ${report.score}%`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`⚠️  Warnings: ${report.summary.warnings}`);
  console.log(`❌ Errors: ${report.summary.errors}\n`);

  return report;
}

// Quick keyboard navigation test
export function testKeyboardNavigation() {
  console.log("⌨️  Testing keyboard navigation...\n");

  const focusableElements = document.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
  );

  console.log(`Found ${focusableElements.length} focusable elements`);

  let issues = 0;

  focusableElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    const tagName = htmlElement.tagName.toLowerCase();
    const role = htmlElement.getAttribute("role");
    const ariaLabel = htmlElement.getAttribute("aria-label");
    const tabIndex = htmlElement.getAttribute("tabindex");

    // Check for positive tabindex
    if (tabIndex && parseInt(tabIndex) > 0) {
      console.warn(
        `⚠️  Element ${index + 1} has positive tabindex (${tabIndex}):`,
        element,
      );
      issues++;
    }

    // Check for missing labels on custom buttons
    if (role === "button" && tagName !== "button" && !ariaLabel) {
      console.warn(
        `⚠️  Custom button element ${index + 1} missing aria-label:`,
        element,
      );
      issues++;
    }

    // Check for keyboard event handlers on custom interactive elements
    if (role === "button" && tagName !== "button") {
      const hasKeyHandler =
        htmlElement.hasAttribute("onkeydown") ||
        htmlElement.hasAttribute("onkeyup") ||
        htmlElement.hasAttribute("onkeypress");

      if (!hasKeyHandler) {
        console.warn(
          `⚠️  Custom button element ${index + 1} missing keyboard handlers:`,
          element,
        );
        issues++;
      }
    }
  });

  if (issues === 0) {
    console.log("✅ No keyboard navigation issues found!");
  } else {
    console.log(`❌ Found ${issues} keyboard navigation issues`);
  }

  return { focusableElements: focusableElements.length, issues };
}

// Test color contrast
export function testColorContrast() {
  console.log("🎨 Testing color contrast...\n");

  const textElements = document.querySelectorAll(
    "p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, input, textarea",
  );
  let issues = 0;

  textElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlElement);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    // Skip elements with transparent backgrounds
    if (
      backgroundColor === "rgba(0, 0, 0, 0)" ||
      backgroundColor === "transparent"
    ) {
      return;
    }

    // Convert to hex and test contrast
    const colorHex = rgbToHex(color);
    const bgHex = rgbToHex(backgroundColor);

    if (colorHex && bgHex) {
      const ratio = getContrastRatio(colorHex, bgHex);

      if (ratio < 4.5) {
        console.warn(
          `⚠️  Low contrast ratio ${ratio.toFixed(2)}:1 on element:`,
          element,
        );
        console.log(`   Color: ${color} (${colorHex})`);
        console.log(`   Background: ${backgroundColor} (${bgHex})`);
        issues++;
      }
    }
  });

  if (issues === 0) {
    console.log("✅ No color contrast issues found!");
  } else {
    console.log(`❌ Found ${issues} color contrast issues`);
  }

  return { tested: textElements.length, issues };
}

// Helper functions
function rgbToHex(rgb: string): string | null {
  if (!rgb || rgb === "rgba(0, 0, 0, 0)" || rgb === "transparent") return null;

  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return null;

  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Export for browser console
if (typeof window !== "undefined") {
  (window as any).accessibilityTests = {
    runAccessibilityTests,
    testComponent,
    testKeyboardNavigation,
    testColorContrast,
  };

  console.log("🚀 Accessibility testing tools loaded!");
  console.log("Available functions:");
  console.log("- accessibilityTests.runAccessibilityTests()");
  console.log("- accessibilityTests.testComponent(selector)");
  console.log("- accessibilityTests.testKeyboardNavigation()");
  console.log("- accessibilityTests.testColorContrast()");
}
