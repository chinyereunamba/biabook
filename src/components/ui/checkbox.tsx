"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const checkboxVariants = cva(
  // Base mobile-first checkbox styles with touch-friendly targets
  "peer shrink-0 rounded-md border border-neutral-300 bg-white shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        // Mobile-first touch targets (minimum 44px touch area)
        sm: "size-5", // 20px visual, but wrapped in larger touch target
        md: "size-6", // 24px visual
        lg: "size-7", // 28px visual
      },
      variant: {
        default:
          "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
        error:
          "border-error-500 data-[state=checked]:bg-error-500 data-[state=checked]:border-error-500 data-[state=checked]:text-white focus-visible:ring-4 focus-visible:ring-error-500/20",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, variant, label, description, ...props }, ref) => {
  const checkboxId = React.useId();

  if (label ?? description) {
    return (
      <div className="flex items-start gap-3">
        {/* Touch-friendly wrapper for minimum 44px touch target */}
        <div className="-m-2 flex min-h-[44px] min-w-[44px] items-center justify-center p-2">
          <CheckboxPrimitive.Root
            ref={ref}
            id={checkboxId}
            data-slot="checkbox"
            className={cn(checkboxVariants({ size, variant }), className)}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              data-slot="checkbox-indicator"
              className="flex items-center justify-center text-current"
            >
              <CheckIcon className="size-4" />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
        </div>

        <div className="flex-1 pt-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className="cursor-pointer text-sm leading-tight font-medium text-neutral-900"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="mt-1 text-sm leading-tight text-neutral-600">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="-m-2 flex min-h-[44px] min-w-[44px] items-center justify-center p-2">
      <CheckboxPrimitive.Root
        ref={ref}
        data-slot="checkbox"
        className={cn(checkboxVariants({ size, variant }), className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-current"
        >
          <CheckIcon className="size-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };
