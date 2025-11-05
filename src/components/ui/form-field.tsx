import * as React from "react";
import { cn } from "@/lib/utils";

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
  // Use React's useId for consistent server/client ID generation
  const baseId = React.useId();
  const fieldId = `${baseId}-field`;
  const labelId = `${baseId}-label`;
  const helpId = helperText ? `${baseId}-help` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;

  // Build describedBy string
  const describedByParts: string[] = [];
  if (helpId) describedByParts.push(helpId);
  if (errorId) describedByParts.push(errorId);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label
          id={labelId}
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
            id: fieldId,
            "aria-labelledby": label ? labelId : undefined,
            "aria-required": required,
            "aria-invalid": !!error,
            "aria-describedby":
              describedByParts.length > 0
                ? describedByParts.join(" ")
                : undefined,
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
