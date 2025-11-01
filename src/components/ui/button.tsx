"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useAccessibleButton } from "@/hooks/use-accessibility";
import { KEYBOARD_KEYS } from "@/lib/accessibility";

const buttonVariants = cva(
  // Base mobile-first styles with touch-friendly targets
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-sm hover:bg-primary/90 focus-visible:outline-primary active:bg-primary/95 disabled:bg-neutral-300 disabled:text-neutral-500",
        secondary:
          "bg-neutral-100 text-neutral-900 border border-neutral-300 shadow-sm hover:bg-neutral-200 hover:border-neutral-400 focus-visible:outline-primary active:bg-neutral-300",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-primary active:bg-neutral-200",
        outline:
          "border border-neutral-300 bg-transparent text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-400 focus-visible:outline-primary active:bg-neutral-100",
        destructive:
          "bg-[#cc0000] text-white shadow-sm hover:bg-error-600 focus-visible:outline-error-500 active:bg-error-700 disabled:bg-neutral-300 disabled:text-neutral-500",
        link: "text-primary underline-offset-4 hover:underline focus-visible:outline-primary p-0 h-auto",
      },
      size: {
        // Mobile-first touch targets (minimum 44px height)
        sm: "h-11 px-4 text-sm rounded-lg min-w-[44px]", // 44px minimum
        md: "h-12 px-6 text-base rounded-lg min-w-[48px]", // 48px comfortable
        lg: "h-14 px-8 text-lg rounded-xl min-w-[56px]", // 56px large
        icon: "size-11 rounded-lg", // Square touch target
        "icon-sm": "size-9 rounded-md",
        "icon-lg": "size-14 rounded-xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  // Accessibility props
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: React.AriaAttributes["aria-expanded"];
  "aria-pressed"?: React.AriaAttributes["aria-pressed"];
  "aria-controls"?: string;
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  icon,
  children,
  disabled,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-expanded": ariaExpanded,
  "aria-pressed": ariaPressed,
  "aria-controls": ariaControls,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  // Enhanced accessibility for buttons
  const accessibilityProps = {
    "aria-label":
      ariaLabel || (typeof children === "string" ? children : undefined),
    "aria-describedby": ariaDescribedBy,
    "aria-expanded": ariaExpanded,
    "aria-pressed": ariaPressed,
    "aria-controls": ariaControls,
    "aria-disabled": disabled || loading,
  };

  // Handle keyboard activation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === KEYBOARD_KEYS.SPACE && !disabled && !loading) {
      event.preventDefault();
      onClick?.(event as any);
    }
    props.onKeyDown?.(event);
  };

  // Create the button content
  const buttonContent = loading ? (
    <>
      <svg
        className="size-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Loading...
    </>
  ) : (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </>
  );

  // When using asChild, we need to clone the child element and pass our props to it
  if (asChild && React.isValidElement(children)) {
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled ?? loading}
        {...props}
      >
        {React.cloneElement(
          children as React.ReactElement,
          {},
          loading ? (
            <>
              <svg
                className="size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </>
          ) : (
            <>
              {icon && <span className="shrink-0">{icon}</span>}
              {children}
            </>
          ),
        )}
      </Comp>
    );
  }

  // Regular button rendering
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      disabled={disabled ?? loading}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...accessibilityProps}
      {...props}
    >
      {buttonContent}
    </Comp>
  );
}

export { Button, buttonVariants };
