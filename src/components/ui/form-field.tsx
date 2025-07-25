import * as React from "react";
import { cn } from "@/lib/utils";
import { createAccessibleFormFieldProps } from "@/lib/accessibility";

export interface FormFieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  helperText,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  // Generate accessible IDs and props
  const { fieldId, labelId, helpId, errorId, fieldProps, labelProps } =
    createAccessibleFormFieldProps(label || "", {
      required,
      invalid: !!error,
      helpText: helperText,
      errorMessage: error,
    });

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label
          {...labelProps}
          htmlFor={fieldId}
          className="block text-sm leading-tight font-medium text-neutral-700"
        >
          {label}
          {required && (
            <span className="text-error-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {React.cloneElement(
          children as React.ReactElement,
          {
            ...fieldProps,
            id: fieldId,
          } as any,
        )}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-error-600 text-sm leading-tight"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helpId} className="text-sm leading-tight text-neutral-600">
          {helperText}
        </p>
      )}
    </div>
  );
}
