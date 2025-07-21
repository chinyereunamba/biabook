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
  const fieldId = React.useId();

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label
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
        {React.cloneElement(children as React.ReactElement, {
          "aria-invalid": !!error,
          "aria-describedby": error
            ? `${fieldId}-error`
            : helperText
              ? `${fieldId}-helper`
              : undefined,
        })}
      </div>

      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-error-600 text-sm leading-tight"
          role="alert"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          id={`${fieldId}-helper`}
          className="text-sm leading-tight text-neutral-600"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
