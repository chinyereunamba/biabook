"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";

// Import the utility function for class name merging
import { cn } from "../../lib/utils";

const radioVariants = cva(
  // Base mobile-first radio styles with touch-friendly targets
  "peer aspect-square shrink-0 rounded-full border border-neutral-300 bg-white shadow-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
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

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentProps<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-3", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, variant, label, description, ...props }, ref) => {
  const radioId = React.useId();

  if (label ?? description) {
    return (
      <div className="flex items-start gap-3">
        {/* Touch-friendly wrapper for minimum 44px touch target */}
        <div className="-m-2 flex min-h-[44px] min-w-[44px] items-center justify-center p-2">
          <RadioGroupPrimitive.Item
            ref={ref}
            id={radioId}
            className={cn(radioVariants({ size, variant }), className)}
            {...props}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <div className="size-2 rounded-full bg-current" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
        </div>

        <div className="flex-1 pt-1">
          {label && (
            <label
              htmlFor={radioId}
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
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(radioVariants({ size, variant }), className)}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <div className="size-2 rounded-full bg-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    </div>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem, radioVariants };
