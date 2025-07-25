import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stackVariants = cva("flex", {
  variants: {
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    spacing: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
      "3xl": "gap-16",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "vertical",
    spacing: "md",
    align: "stretch",
    justify: "start",
    wrap: false,
  },
});

export interface StackProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof stackVariants> {
  asChild?: boolean;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction,
      spacing,
      align,
      justify,
      wrap,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? React.Fragment : "div";

    if (asChild) {
      return <React.Fragment {...props} />;
    }

    return (
      <div
        ref={ref}
        className={cn(
          stackVariants({ direction, spacing, align, justify, wrap }),
          className,
        )}
        {...props}
      />
    );
  },
);

Stack.displayName = "Stack";

// Convenience components for common patterns
const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  ({ ...props }, ref) => {
    return <Stack ref={ref} direction="vertical" {...props} />;
  },
);

VStack.displayName = "VStack";

const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  ({ ...props }, ref) => {
    return <Stack ref={ref} direction="horizontal" {...props} />;
  },
);

HStack.displayName = "HStack";

export { Stack, VStack, HStack, stackVariants };
