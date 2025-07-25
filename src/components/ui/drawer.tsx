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
  SheetTrigger,
  SheetClose,
} from "./sheet";
import { useAccessibility } from "@/hooks/use-accessibility";
import { KEYBOARD_KEYS } from "@/lib/accessibility";

const drawerVariants = cva("bg-white border-r border-neutral-200 shadow-xl", {
  variants: {
    size: {
      sm: "w-64",
      md: "w-80",
      lg: "w-96",
      full: "w-full max-w-sm",
    },
    overlay: {
      true: "backdrop-blur-sm",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    overlay: true,
  },
});

export interface DrawerProps
  extends React.ComponentProps<typeof Sheet>,
    VariantProps<typeof drawerVariants> {
  children: React.ReactNode;
}

function Drawer({ children, ...props }: DrawerProps) {
  return <Sheet {...props}>{children}</Sheet>;
}

export interface DrawerContentProps
  extends Omit<React.ComponentProps<typeof SheetContent>, "side">,
    VariantProps<typeof drawerVariants> {
  side?: "left" | "right";
}

function DrawerContent({
  className,
  children,
  size,
  overlay,
  side = "left",
  ...props
}: DrawerContentProps) {
  return (
    <SheetContent
      side={side}
      className={cn(
        drawerVariants({ size, overlay }),
        "flex h-full flex-col gap-0 p-0",
        className,
      )}
      {...props}
    >
      {children}
    </SheetContent>
  );
}

function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<typeof SheetHeader>) {
  return (
    <SheetHeader
      className={cn(
        "flex-shrink-0 border-b border-neutral-100 px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<typeof SheetFooter>) {
  return (
    <SheetFooter
      className={cn(
        "mt-auto flex-shrink-0 border-t border-neutral-100 px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetTitle>) {
  return (
    <SheetTitle
      className={cn("text-lg font-semibold text-neutral-900", className)}
      {...props}
    />
  );
}

function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-auto px-6 py-4", className)}
      {...props}
    />
  );
}

// Navigation specific components
function DrawerNav({
  className,
  children,
  ...props
}: React.ComponentProps<"nav">) {
  const { containerRef } = useAccessibility({
    role: "menu",
    enableKeyboardNavigation: true,
    onArrowKeys: (key) => {
      const menuItems =
        containerRef.current?.querySelectorAll('[role="menuitem"]');
      if (!menuItems) return;

      const currentIndex = Array.from(menuItems).findIndex(
        (item) => item === document.activeElement,
      );
      let nextIndex = currentIndex;

      if (key === KEYBOARD_KEYS.ARROW_DOWN) {
        nextIndex = (currentIndex + 1) % menuItems.length;
      } else if (key === KEYBOARD_KEYS.ARROW_UP) {
        nextIndex =
          currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
      }

      (menuItems[nextIndex] as HTMLElement)?.focus();
    },
  });

  return (
    <nav
      ref={containerRef}
      className={cn("flex flex-col space-y-1", className)}
      role="menu"
      aria-label="Navigation menu"
      {...props}
    >
      {children}
    </nav>
  );
}

function DrawerNavItem({
  className,
  active = false,
  children,
  ...props
}: React.ComponentProps<"a"> & { active?: boolean }) {
  return (
    <a
      className={cn(
        "flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-neutral-100 hover:text-neutral-900",
        "focus:text-neutral-90utline-none focus:ring-primary focus:bg-neutral-100 focus:ring-2 focus:ring-offset-2",
        active
          ? "bg-primary/10 text-primary border-primary border-r-2"
          : "text-neutral-700",
        className,
      )}
      role="menuitem"
      aria-current={active ? "page" : undefined}
      tabIndex={0}
      {...props}
    >
      {children}
    </a>
  );
}

function DrawerNavGroup({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"div"> & { title?: string }) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {title && (
        <div className="px-3 py-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

const DrawerTrigger = SheetTrigger;
const DrawerClose = SheetClose;

export {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerBody,
  DrawerNav,
  DrawerNavItem,
  DrawerNavGroup,
  DrawerTrigger,
  DrawerClose,
  drawerVariants,
};
