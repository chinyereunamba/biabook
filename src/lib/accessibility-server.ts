/**
 * Server-safe accessibility utilities
 * These functions can be used during server-side rendering
 */

import type { AriaAttributes } from "react";

/**
 * Generate a unique accessible ID using crypto.randomUUID (server-safe version)
 * Falls back to timestamp-based ID if crypto is not available
 */
export function generateAccessibleId(prefix: string = "field"): string {
  try {
    // Use crypto.randomUUID if available (Node.js 16+ and modern browsers)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
    }
  } catch (error) {
    // Fallback if crypto is not available
  }

  // Fallback to timestamp + random for older environments
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Server-safe version of createAccessibleFormFieldProps
 */
export function createAccessibleFormFieldProps(
  label: string,
  options: {
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
    helpText?: string;
    errorMessage?: string;
  } = {},
): {
  fieldId: string;
  labelId: string;
  helpId?: string;
  errorId?: string;
  fieldProps: Record<string, any>;
  labelProps: Record<string, any>;
} {
  const fieldId = generateAccessibleId("field");
  const labelId = generateAccessibleId("label");
  const helpId = options.helpText ? generateAccessibleId("help") : undefined;
  const errorId = options.errorMessage
    ? generateAccessibleId("error")
    : undefined;

  // Build describedBy string
  const describedByParts: string[] = [];
  if (options.describedBy) describedByParts.push(options.describedBy);
  if (helpId) describedByParts.push(helpId);
  if (errorId) describedByParts.push(errorId);

  const fieldProps = {
    id: fieldId,
    "aria-labelledby": labelId,
    "aria-required": options.required,
    "aria-invalid": options.invalid,
    "aria-describedby":
      describedByParts.length > 0 ? describedByParts.join(" ") : undefined,
  };

  const labelProps = {
    id: labelId,
    htmlFor: fieldId,
  };

  return {
    fieldId,
    labelId,
    helpId,
    errorId,
    fieldProps,
    labelProps,
  };
}
