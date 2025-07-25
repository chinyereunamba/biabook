import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gridVariants = cva("grid w-full", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-4 sm:grid-cols-6 lg:grid-cols-12",
    },
    gap: {
      none: "gap-0",
      sm: "gap-2 sm:gap-3",
      md: "gap-3 sm:gap-4",
      lg: "gap-4 sm:gap-6",
      xl: "gap-6 sm:gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-items-start",
      center: "justify-items-center",
      end: "justify-items-end",
      stretch: "justify-items-stretch",
    },
  },
  defaultVariants: {
    cols: 1,
    gap: "md",
    align: "stretch",
    justify: "stretch",
  },
});

export interface GridProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof gridVariants> {
  asChild?: boolean;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { className, cols, gap, align, justify, asChild = false, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(gridVariants({ cols, gap, align, justify }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

Grid.displayName = "Grid";

// Grid Item component for more control
const gridItemVariants = cva("", {
  variants: {
    colSpan: {
      1: "col-span-1",
      2: "col-span-1 sm:col-span-2",
      3: "col-span-1 sm:col-span-2 lg:col-span-3",
      4: "col-span-1 sm:col-span-2 lg:col-span-4",
      6: "col-span-2 sm:col-span-3 lg:col-span-6",
      full: "col-span-full",
    },
    rowSpan: {
      1: "row-span-1",
      2: "row-span-2",
      3: "row-span-3",
      4: "row-span-4",
      auto: "row-span-auto",
    },
  },
  defaultVariants: {
    colSpan: 1,
    rowSpan: 1,
  },
});

export interface GridItemProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof gridItemVariants> {
  asChild?: boolean;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        className={cn(gridItemVariants({ colSpan, rowSpan }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

GridItem.displayName = "GridItem";

export { Grid, GridItem, gridVariants, gridItemVariants };