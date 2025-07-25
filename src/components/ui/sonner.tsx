"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import useBreakpoint from "@/hooks/use-breakpoint";

interface MobileToasterProps extends ToasterProps {
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
}

const Toaster = ({ position = "top-center", ...props }: MobileToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useBreakpoint("sm");

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : position}
      offset={isMobile ? "16px" : "32px"}
      gap={8}
      visibleToasts={isMobile ? 3 : 5}
      toastOptions={{
        className:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        style: {
          minHeight: isMobile ? "56px" : "48px",
          padding: isMobile ? "12px 16px" : "16px 20px",
          fontSize: isMobile ? "16px" : "14px",
          borderRadius: "12px",
          maxWidth: isMobile ? "calc(100vw - 32px)" : "400px",
        } as React.CSSProperties,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--ds-color-success-50)",
          "--success-text": "var(--ds-color-success-600)",
          "--error-bg": "var(--ds-color-error-50)",
          "--error-text": "var(--ds-color-error-600)",
          "--warning-bg": "var(--ds-color-warning-50)",
          "--warning-text": "var(--ds-color-warning-600)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

// Mobile-optimized toast functions
const toast = {
  success: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return (window as any).sonner?.toast?.success(message, {
      duration: 4000,
      ...options,
    });
  },
  error: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return (window as any).sonner?.toast?.error(message, {
      duration: 5000,
      ...options,
    });
  },
  warning: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return (window as any).sonner?.toast?.warning(message, {
      duration: 4000,
      ...options,
    });
  },
  info: (
    message: string,
    options?: { description?: string; duration?: number },
  ) => {
    return (window as any).sonner?.toast?.info(message, {
      duration: 3000,
      ...options,
    });
  },
  loading: (message: string) => {
    return (window as any).sonner?.toast?.loading(message);
  },
  dismiss: (toastId?: string | number) => {
    return (window as any).sonner?.toast?.dismiss(toastId);
  },
};

export { Toaster, toast };
