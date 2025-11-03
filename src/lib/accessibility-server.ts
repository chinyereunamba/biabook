/**
 * Server-safe accessibility utilities
 * These functions can be used during server-side rendering
 */

import type { AriaAttributes } from "react";

// Simple counter for generating unique IDs during SSR
let idCounter = 0;

/**
 * Generate a unique accessible ID (server-safe version)
 */
export function generateAccessibleId(prefix: string = "field"): string {
  return `${prefix}-${++idCounter}`;
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
