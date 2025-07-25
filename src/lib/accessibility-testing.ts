/**
 * Automated accessibility testing utilities
 */

import { ColorContrastUtils } from "./accessibility";

// Accessibility test results interface
export interface AccessibilityTestResult {
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
  element?: HTMLElement;
  rule: string;
}

export interface AccessibilityReport {
  passed: boolean;
  score: number;
  results: AccessibilityTestResult[];
  summary: {
    errors: number;
    warnings: number;
    passed: number;
  };
}

// WCAG 2.1 AA compliance checker
export class AccessibilityTester {
  private results: AccessibilityTestResult[] = [];

  // Test color contrast ratios
  testColorContrast(element: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const computedStyle = window.getComputedStyle(element);
    const color = this.rgbToHex(computedStyle.color);
    const backgroundColor = this.rgbToHex(computedStyle.backgroundColor);

    if (color && backgroundColor) {
      const ratio = ColorContrastUtils.getContrastRatio(color, backgroundColor);
      const meetsAA = ColorContrastUtils.meetsWCAGAA(color, backgroundColor);
      const meetsAAA = ColorContrastUtils.meetsWCAGAAA(color, backgroundColor);

      if (!meetsAA) {
        results.push({
          passed: false,
          message: `Color contrast ratio ${ratio.toFixed(2)}:1 does not meet WCAG AA standard (4.5:1)`,
          severity: "error",
          element,
          rule: "WCAG 1.4.3 Contrast (Minimum)",
        });
      } else if (!meetsAAA) {
        results.push({
          passed: true,
          message: `Color contrast ratio ${ratio.toFixed(2)}:1 meets WCAG AA but not AAA standard (7:1)`,
          severity: "warning",
          element,
          rule: "WCAG 1.4.6 Contrast (Enhanced)",
        });
      } else {
        results.push({
          passed: true,
          message: `Color contrast ratio ${ratio.toFixed(2)}:1 meets WCAG AAA standard`,
          severity: "info",
          element,
          rule: "WCAG 1.4.6 Contrast (Enhanced)",
        });
      }
    }

    return results;
  }

  // Test keyboard accessibility
  testKeyboardAccessibility(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const focusableElements = this.getFocusableElements(container);

    // Check if interactive elements are keyboard accessible
    focusableElements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute("role");
      const tabIndex = element.getAttribute("tabindex");

      // Check for proper tabindex usage
      if (tabIndex && parseInt(tabIndex) > 0) {
        results.push({
          passed: false,
          message:
            "Avoid positive tabindex values as they disrupt natural tab order",
          severity: "warning",
          element,
          rule: "WCAG 2.4.3 Focus Order",
        });
      }

      // Check for keyboard event handlers on non-interactive elements
      if (role === "button" && tagName !== "button" && tagName !== "input") {
        const hasKeyHandler =
          element.hasAttribute("onkeydown") ||
          element.hasAttribute("onkeyup") ||
          element.hasAttribute("onkeypress");

        if (!hasKeyHandler) {
          results.push({
            passed: false,
            message:
              "Custom button elements should handle keyboard events (Enter/Space)",
            severity: "error",
            element,
            rule: "WCAG 2.1.1 Keyboard",
          });
        }
      }
    });

    // Check for skip links
    const skipLinks = container.querySelectorAll(
      '.skip-link, [href="#main"], [href="#content"]',
    );
    if (skipLinks.length === 0 && container === document.body) {
      results.push({
        passed: false,
        message: "Page should include skip links for keyboard navigation",
        severity: "warning",
        rule: "WCAG 2.4.1 Bypass Blocks",
      });
    }

    return results;
  }

  // Test ARIA attributes
  testAriaAttributes(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const elementsWithAria = container.querySelectorAll(
      "[aria-label], [aria-labelledby], [aria-describedby], [role]",
    );

    elementsWithAria.forEach((element) => {
      const htmlElement = element as HTMLElement;

      // Check for empty aria-label
      const ariaLabel = htmlElement.getAttribute("aria-label");
      if (ariaLabel !== null && ariaLabel.trim() === "") {
        results.push({
          passed: false,
          message: "aria-label should not be empty",
          severity: "error",
          element: htmlElement,
          rule: "WCAG 4.1.2 Name, Role, Value",
        });
      }

      // Check for valid aria-labelledby references
      const ariaLabelledby = htmlElement.getAttribute("aria-labelledby");
      if (ariaLabelledby) {
        const ids = ariaLabelledby.split(" ");
        ids.forEach((id) => {
          if (!document.getElementById(id)) {
            results.push({
              passed: false,
              message: `aria-labelledby references non-existent element with id "${id}"`,
              severity: "error",
              element: htmlElement,
              rule: "WCAG 4.1.2 Name, Role, Value",
            });
          }
        });
      }

      // Check for valid aria-describedby references
      const ariaDescribedby = htmlElement.getAttribute("aria-describedby");
      if (ariaDescribedby) {
        const ids = ariaDescribedby.split(" ");
        ids.forEach((id) => {
          if (!document.getElementById(id)) {
            results.push({
              passed: false,
              message: `aria-describedby references non-existent element with id "${id}"`,
              severity: "error",
              element: htmlElement,
              rule: "WCAG 4.1.2 Name, Role, Value",
            });
          }
        });
      }

      // Check for proper role usage
      const role = htmlElement.getAttribute("role");
      if (role) {
        const validRoles = [
          "button",
          "link",
          "menuitem",
          "tab",
          "tabpanel",
          "dialog",
          "alert",
          "alertdialog",
          "application",
          "article",
          "banner",
          "complementary",
          "contentinfo",
          "form",
          "main",
          "navigation",
          "region",
          "search",
          "checkbox",
          "radio",
          "textbox",
          "slider",
          "spinbutton",
          "progressbar",
          "grid",
          "gridcell",
          "row",
          "columnheader",
          "rowheader",
          "listbox",
          "option",
          "combobox",
          "menu",
          "menubar",
          "tablist",
          "tree",
          "treeitem",
        ];

        if (!validRoles.includes(role)) {
          results.push({
            passed: false,
            message: `Invalid ARIA role "${role}"`,
            severity: "error",
            element: htmlElement,
            rule: "WCAG 4.1.2 Name, Role, Value",
          });
        }
      }
    });

    return results;
  }

  // Test form accessibility
  testFormAccessibility(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const forms = container.querySelectorAll("form");

    forms.forEach((form) => {
      const inputs = form.querySelectorAll("input, select, textarea");

      inputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement;
        const id = htmlInput.id;
        const name = htmlInput.name;
        const type = htmlInput.type;
        const required = htmlInput.required;

        // Check for proper labeling
        const label = form.querySelector(`label[for="${id}"]`);
        const ariaLabel = htmlInput.getAttribute("aria-label");
        const ariaLabelledby = htmlInput.getAttribute("aria-labelledby");

        if (!label && !ariaLabel && !ariaLabelledby) {
          results.push({
            passed: false,
            message: "Form input must have an associated label",
            severity: "error",
            element: htmlInput,
            rule: "WCAG 3.3.2 Labels or Instructions",
          });
        }

        // Check for required field indication
        if (required) {
          const ariaRequired = htmlInput.getAttribute("aria-required");
          if (ariaRequired !== "true") {
            results.push({
              passed: false,
              message: 'Required fields should have aria-required="true"',
              severity: "warning",
              element: htmlInput,
              rule: "WCAG 3.3.2 Labels or Instructions",
            });
          }
        }

        // Check for error handling
        const ariaInvalid = htmlInput.getAttribute("aria-invalid");
        const ariaDescribedby = htmlInput.getAttribute("aria-describedby");

        if (ariaInvalid === "true" && !ariaDescribedby) {
          results.push({
            passed: false,
            message:
              "Invalid fields should reference error message with aria-describedby",
            severity: "error",
            element: htmlInput,
            rule: "WCAG 3.3.1 Error Identification",
          });
        }
      });
    });

    return results;
  }

  // Test heading structure
  testHeadingStructure(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");

    if (headings.length === 0) {
      results.push({
        passed: false,
        message: "Page should have at least one heading",
        severity: "warning",
        rule: "WCAG 2.4.6 Headings and Labels",
      });
      return results;
    }

    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (index === 0 && level !== 1) {
        results.push({
          passed: false,
          message: "Page should start with an h1 heading",
          severity: "warning",
          element: heading as HTMLElement,
          rule: "WCAG 2.4.6 Headings and Labels",
        });
      }

      if (level > previousLevel + 1) {
        results.push({
          passed: false,
          message: `Heading level ${level} skips level ${previousLevel + 1}`,
          severity: "error",
          element: heading as HTMLElement,
          rule: "WCAG 2.4.6 Headings and Labels",
        });
      }

      if (heading.textContent?.trim() === "") {
        results.push({
          passed: false,
          message: "Headings should not be empty",
          severity: "error",
          element: heading as HTMLElement,
          rule: "WCAG 2.4.6 Headings and Labels",
        });
      }

      previousLevel = level;
    });

    return results;
  }

  // Test image accessibility
  testImageAccessibility(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const images = container.querySelectorAll("img");

    images.forEach((img) => {
      const alt = img.getAttribute("alt");
      const role = img.getAttribute("role");
      const ariaLabel = img.getAttribute("aria-label");

      // Check for alt text
      if (alt === null && role !== "presentation" && !ariaLabel) {
        results.push({
          passed: false,
          message: 'Images must have alt text or role="presentation"',
          severity: "error",
          element: img,
          rule: "WCAG 1.1.1 Non-text Content",
        });
      }

      // Check for empty alt on decorative images
      if (alt === "" && role !== "presentation") {
        results.push({
          passed: true,
          message: "Decorative image with empty alt text",
          severity: "info",
          element: img,
          rule: "WCAG 1.1.1 Non-text Content",
        });
      }

      // Check for meaningful alt text
      if (
        alt &&
        (alt.toLowerCase().includes("image") ||
          alt.toLowerCase().includes("picture"))
      ) {
        results.push({
          passed: false,
          message:
            "Alt text should describe the image content, not that it is an image",
          severity: "warning",
          element: img,
          rule: "WCAG 1.1.1 Non-text Content",
        });
      }
    });

    return results;
  }

  // Test touch target sizes
  testTouchTargets(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]',
    );

    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const rect = htmlElement.getBoundingClientRect();
      const minSize = 44; // WCAG AA minimum touch target size

      if (rect.width < minSize || rect.height < minSize) {
        results.push({
          passed: false,
          message: `Touch target size ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px is smaller than minimum 44x44px`,
          severity: "warning",
          element: htmlElement,
          rule: "WCAG 2.5.5 Target Size",
        });
      }
    });

    return results;
  }

  // Run comprehensive accessibility test
  runFullTest(container: HTMLElement = document.body): AccessibilityReport {
    this.results = [];

    // Run all tests
    this.results.push(...this.testColorContrast(container));
    this.results.push(...this.testKeyboardAccessibility(container));
    this.results.push(...this.testAriaAttributes(container));
    this.results.push(...this.testFormAccessibility(container));
    this.results.push(...this.testHeadingStructure(container));
    this.results.push(...this.testImageAccessibility(container));
    this.results.push(...this.testTouchTargets(container));

    // Calculate summary
    const errors = this.results.filter((r) => r.severity === "error").length;
    const warnings = this.results.filter(
      (r) => r.severity === "warning",
    ).length;
    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;

    const score =
      total > 0 ? Math.round(((passed + warnings * 0.5) / total) * 100) : 100;

    return {
      passed: errors === 0,
      score,
      results: this.results,
      summary: {
        errors,
        warnings,
        passed,
      },
    };
  }

  // Helper methods
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(", ");

    return Array.from(
      container.querySelectorAll(focusableSelectors),
    ) as HTMLElement[];
  }

  private rgbToHex(rgb: string): string | null {
    if (!rgb || rgb === "rgba(0, 0, 0, 0)" || rgb === "transparent")
      return null;

    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return null;

    const r = parseInt(match[0] ?? '0');
    const g = parseInt(match[1] ?? '0');
    const b = parseInt(match[2] ?? '0');

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

// Screen reader testing utilities
export class ScreenReaderTester {
  // Test screen reader announcements
  static testAnnouncements(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const liveRegions = container.querySelectorAll("[aria-live]");

    liveRegions.forEach((region) => {
      const htmlRegion = region as HTMLElement;
      const ariaLive = htmlRegion.getAttribute("aria-live");
      const ariaAtomic = htmlRegion.getAttribute("aria-atomic");

      if (ariaLive && !["polite", "assertive", "off"].includes(ariaLive)) {
        results.push({
          passed: false,
          message: `Invalid aria-live value "${ariaLive}". Use "polite", "assertive", or "off"`,
          severity: "error",
          element: htmlRegion,
          rule: "WCAG 4.1.2 Name, Role, Value",
        });
      }

      if (ariaAtomic && !["true", "false"].includes(ariaAtomic)) {
        results.push({
          passed: false,
          message: `Invalid aria-atomic value "${ariaAtomic}". Use "true" or "false"`,
          severity: "error",
          element: htmlRegion,
          rule: "WCAG 4.1.2 Name, Role, Value",
        });
      }
    });

    return results;
  }

  // Test landmark regions
  static testLandmarks(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const landmarks = container.querySelectorAll(
      'main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
    );

    if (landmarks.length === 0) {
      results.push({
        passed: false,
        message:
          "Page should have landmark regions for screen reader navigation",
        severity: "warning",
        rule: "WCAG 2.4.1 Bypass Blocks",
      });
    }

    // Check for main landmark
    const mainLandmarks = container.querySelectorAll('main, [role="main"]');
    if (mainLandmarks.length === 0) {
      results.push({
        passed: false,
        message: "Page should have a main landmark",
        severity: "warning",
        rule: "WCAG 2.4.1 Bypass Blocks",
      });
    } else if (mainLandmarks.length > 1) {
      results.push({
        passed: false,
        message: "Page should have only one main landmark",
        severity: "error",
        rule: "WCAG 2.4.1 Bypass Blocks",
      });
    }

    return results;
  }
}

// Export testing utilities
export const accessibilityTester = new AccessibilityTester();