"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SwipeGesture } from "./mobile-gestures";
import { SlideTransition } from "./interactions";

interface MobileTab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface MobileTabsProps {
  tabs: MobileTab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline" | "buttons";
  size?: "sm" | "md" | "lg";
  swipeable?: boolean;
  className?: string;
}

function MobileTabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = "default",
  size = "md",
  swipeable = true,
  className,
}: MobileTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState(
    defaultTab || tabs[0]?.id || "",
  );

  const activeTab = controlledActiveTab ?? internalActiveTab;
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  const handleTabChange = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const handleSwipeLeft = () => {
    if (!swipeable) return;
    const nextIndex = Math.min(activeIndex + 1, tabs.length - 1);
    const nextTab = tabs[nextIndex];
    if (nextIndex !== activeIndex && nextTab && !nextTab.disabled) {
      handleTabChange(nextTab.id);
    }
  };

  const handleSwipeRight = () => {
    if (!swipeable) return;
    const prevIndex = Math.max(activeIndex - 1, 0);
    const prevTab = tabs[prevIndex];
    if (prevIndex !== activeIndex && prevTab && !prevTab.disabled) {
      handleTabChange(prevTab.id);
    }
  };

  const sizeClasses = {
    sm: "h-8 text-xs px-3",
    md: "h-10 text-sm px-4",
    lg: "h-12 text-base px-6",
  };

  const variantClasses = {
    default: {
      container: "bg-muted p-1 rounded-lg",
      tab: "rounded-md transition-all duration-200",
      active: "bg-background text-foreground shadow-sm",
      inactive: "text-muted-foreground hover:text-foreground",
    },
    pills: {
      container: "bg-transparent",
      tab: "rounded-full border transition-all duration-200",
      active: "bg-primary text-primary-foreground border-primary",
      inactive:
        "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
    },
    underline: {
      container: "bg-transparent border-b border-border",
      tab: "border-b-2 border-transparent transition-all duration-200 rounded-none",
      active: "border-primary text-primary",
      inactive:
        "text-muted-foreground hover:text-foreground hover:border-muted-foreground",
    },
    buttons: {
      container: "bg-transparent gap-2",
      tab: "border rounded-lg transition-all duration-200",
      active: "bg-primary text-primary-foreground border-primary",
      inactive:
        "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
    },
  };

  const currentVariant = variantClasses[variant];

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <div
        className={cn(
          "flex items-center",
          variant === "buttons" ? "flex-wrap gap-2" : "relative",
          currentVariant.container,
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center justify-center gap-2 font-medium whitespace-nowrap",
              "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              sizeClasses[size],
              currentVariant.tab,
              tab.id === activeTab
                ? currentVariant.active
                : currentVariant.inactive,
              variant !== "buttons" && "flex-1",
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>
            {tab.badge && (
              <span
                className={cn(
                  "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-medium",
                  tab.id === activeTab
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {swipeable ? (
          <SwipeGesture
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            className="min-h-0"
          >
            <div className="relative">
              {tabs.map((tab, index) => (
                <SlideTransition
                  key={tab.id}
                  show={tab.id === activeTab}
                  direction={
                    index > activeIndex
                      ? "left"
                      : index < activeIndex
                        ? "right"
                        : "up"
                  }
                  className={cn(tab.id === activeTab ? "block" : "hidden")}
                >
                  {tab.content}
                </SlideTransition>
              ))}
            </div>
          </SwipeGesture>
        ) : (
          <div>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "animate-fade-in",
                  tab.id === activeTab ? "block" : "hidden",
                )}
              >
                {tab.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swipe Indicator */}
      {swipeable && tabs.length > 1 && (
        <div className="mt-4 flex justify-center space-x-1">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-200",
                index === activeIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
              aria-label={`Go to ${tab.label}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simplified mobile tab bar for bottom navigation
export interface MobileTabBarProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    disabled?: boolean;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

function MobileTabBar({
  tabs,
  activeTab,
  onTabChange,
  className,
}: MobileTabBarProps) {
  return (
    <div
      className={cn(
        "bg-background border-border flex items-center justify-around border-t",
        "safe-area-inset-bottom pb-safe",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-3 py-2",
            "transition-colors duration-200",
            "focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
            "disabled:cursor-not-allowed disabled:opacity-50",
            tab.id === activeTab
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div className="relative">
            <span className="flex-shrink-0">{tab.icon}</span>
            {tab.badge && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                {tab.badge}
              </span>
            )}
          </div>
          <span className="max-w-full truncate text-xs font-medium">
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Scrollable tab navigation for many tabs
export interface ScrollableTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

function ScrollableTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: ScrollableTabsProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const activeTabRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (activeTabRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeElement = activeTabRef.current;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      if (
        activeRect.left < containerRect.left ||
        activeRect.right > containerRect.right
      ) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className="scrollbar-hide flex items-center gap-1 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={tab.id === activeTab ? activeTabRef : undefined}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap",
              "flex-shrink-0 transition-all duration-200",
              "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              tab.id === activeTab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fade indicators for scrollable content */}
      <div className="from-background pointer-events-none absolute top-0 bottom-2 left-0 w-4 bg-gradient-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute top-0 right-0 bottom-2 w-4 bg-gradient-to-l to-transparent" />
    </div>
  );
}

export { MobileTabs, MobileTabBar, ScrollableTabs };
