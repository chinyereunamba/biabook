import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva("w-full mx-auto px-4 sm:px-6", {
  variants: {
    size: {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full",
      content: "max-w-3xl", // Optimal for reading content
    },
    padding: {
      none: "px-0",
      sm: "px-3 sm:px-4",
      md: "px-4 sm:px-6",
      lg: "px-6 sm:px-8",
      xl: "px-8 sm:px-12",
    },
    center: {
      true: "mx-auto",
      false: "",
    },
  },
  defaultVariants: {
    size: "lg",
    padding: "md",
    center: true,
  },
});

export interface ContainerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof containerVariants> {
  asChild?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, center, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(containerVariants({ size, padding, center }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

Container.displayName = "Container";

export { Container, containerVariants };