"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "./sheet";

const bottomSheetVariants = cva(
  "bg-white rounded-t-2xl border-t border-neutral-200 shadow-2xl",
  {
    variants: {
      size: {
        sm: "max-h-[40vh]",
        md: "max-h-[60vh]",
        lg: "max-h-[80vh]",
        full: "max-h-[95vh]",
        auto: "max-h-fit",
      },
      snapPoints: {
        true: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      snapPoints: true,
    },
  }
);

export interface BottomSheetProps
  extends React.ComponentProps<typeof Sheet>,
    VariantProps<typeof bottomSheetVariants> {
  children: React.ReactNode;
}

function BottomSheet({ children, ...props }: BottomSheetProps) {
  return <Sheet {...props}>{children}</Sheet>;
}

export interface BottomSheetContentProps
  extends Omit<React.ComponentProps<typeof SheetContent>, "side">,
    VariantProps<typeof bottomSheetVariants> {
  showHandle?: boolean;
}

function BottomSheetContent({
  className,
  children,
  size,
  snapPoints,
  showHandle = true,
  ...props
}: BottomSheetContentProps) {
  return (
    <SheetContent
      side="bottom"
      className={cn(
        bottomSheetVariants({ size, snapPoints }),
        "p-0 gap-0 w-full",
        className
      )}
      {...props}
    >
      {showHandle && (
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-neutral-300 rounded-full" />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </SheetContent>
  );
}

function BottomSheetHeader({ className, ...props }: React.ComponentProps<typeof SheetHeader>) {
  return (
    <SheetHeader
      className={cn(
        "px-6 py-4 border-b border-neutral-100 text-center",
        className
      )}
      {...props}
    />
  );
}

function BottomSheetFooter({ className, ...props }: React.ComponentProps<typeof SheetFooter>) {
  return (
    <SheetFooter
      className={cn(
        "px-6 py-4 border-t border-neutral-100 mt-0 flex-row gap-3",
        className
      )}
      {...props}
    />
  );
}

function BottomSheetTitle({ className, ...props }: React.ComponentProps<typeof SheetTitle>) {
  return (
    <SheetTitle
      className={cn("text-lg font-semibold text-neutral-900", className)}
      {...props}
    />
  );
}

function BottomSheetDescription({ className, ...props }: React.ComponentProps<typeof SheetDescription>) {
  return (
    <SheetDescription
      className={cn("text-sm text-neutral-600 mt-1", className)}
      {...props}
    />
  );
}

function BottomSheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("px-6 py-4 flex-1", className)}
      {...props}
    />
  );
}

const BottomSheetTrigger = SheetTrigger;
const BottomSheetClose = SheetClose;

export {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetBody,
  BottomSheetTrigger,
  BottomSheetClose,
  bottomSheetVariants,
};