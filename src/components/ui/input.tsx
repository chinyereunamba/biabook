import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { createAccessibleFormFieldProps } from "@/lib/accessibility";

const inputVariants = cva(
  // Base mobile-first styles with touch-friendly targets
  "flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
  {
    variants: {
      variant: {
        default:
          "border-input focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]",
        error:
          "border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        success:
          "border-success-500 focus-visible:border-success-500 focus-visible:ring-success-500/50 focus-visible:ring-[3px]",
      },
      size: {
        // Mobile-first touch targets (minimum 44px height)
        sm: "h-8 px-3 py-1 text-xs",
        md: "h-9 px-3 py-1 text-sm",
        lg: "h-11 px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      label,
      helperText,
      error,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    // Use error variant if error is provided
    const inputVariant = error ? "error" : variant;

    // Generate accessible IDs and props
    const { fieldId, labelId, helpId, errorId, fieldProps, labelProps } =
      createAccessibleFormFieldProps(label || "", {
        required: props.required,
        invalid: !!error,
        helpText: helperText,
        errorMessage: error,
      });

    return (
      <div className="w-full">
        {label && (
          <label
            {...labelProps}
            htmlFor={fieldId}
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            {label}
            {props.required && (
              <span className="text-error-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            {...fieldProps}
            id={fieldId}
            type={type}
            data-slot="input"
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              rightIcon && "pr-10",
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="text-error-600 mt-2 text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helpId} className="mt-2 text-sm text-neutral-600">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
