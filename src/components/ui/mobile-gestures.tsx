"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Touch gesture types
interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// Swipe gesture component
function SwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
  children,
  className,
  disabled = false,
}: SwipeGestureProps) {
  const touchStart = React.useRef<TouchPoint | null>(null);
  const touchEnd = React.useRef<TouchPoint | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    if (!touch) return;
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
  };

  const handleTouchEnd = () => {
    if (disabled || !touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.timestamp - touchStart.current.timestamp;

    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    if (velocity < velocityThreshold) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY && absX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <div
      className={cn("touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Long press gesture component
interface LongPressProps {
  onLongPress: () => void;
  delay?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function LongPress({
  onLongPress,
  delay = 500,
  children,
  className,
  disabled = false,
}: LongPressProps) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = React.useState(false);

  const handleStart = () => {
    if (disabled) return;

    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, delay);
  };

  const handleEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPressed(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "select-none",
        isPressed && "scale-95 transition-transform duration-100",
        className,
      )}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      {children}
    </div>
  );
}

// Double tap gesture component
interface DoubleTapProps {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function DoubleTap({
  onDoubleTap,
  onSingleTap,
  delay = 300,
  children,
  className,
  disabled = false,
}: DoubleTapProps) {
  const tapTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = React.useRef<number>(0);

  const handleTap = () => {
    if (disabled) return;

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (timeDiff < delay && timeDiff > 0) {
      // Double tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      // Potential single tap
      lastTapRef.current = now;
      if (onSingleTap) {
        tapTimeoutRef.current = setTimeout(() => {
          onSingleTap();
        }, delay);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("cursor-pointer", className)} onClick={handleTap}>
      {children}
    </div>
  );
}

// Pull to refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function PullToRefresh({
  onRefresh,
  threshold = 80,
  children,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [canPull, setCanPull] = React.useState(false);
  const touchStartY = React.useRef<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    const scrollTop = containerRef.current?.scrollTop || 0;
    setCanPull(scrollTop === 0);
    const touch = e.touches[0];
    if (!touch) return;
    touchStartY.current = touch.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !canPull) return;

    const touch = e.touches[0];
    if (!touch) return;
    const touchY = touch.clientY;
    const distance = Math.max(0, touchY - touchStartY.current);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || !canPull) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setCanPull(false);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 right-0 left-0 flex items-center justify-center transition-all duration-200 ease-out"
        style={{
          height: pullDistance,
          opacity: pullProgress,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`,
        }}
      >
        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <div
            className={cn(
              "h-5 w-5 rounded-full border-2 border-current transition-transform duration-200",
              isRefreshing ? "animate-spin border-t-transparent" : "",
              pullProgress >= 1 ? "rotate-180" : "",
            )}
            style={{
              transform: `rotate(${pullProgress * 180}deg)`,
            }}
          />
          <span>
            {isRefreshing
              ? "Refreshing..."
              : pullProgress >= 1
                ? "Release to refresh"
                : "Pull to refresh"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Swipeable card component for mobile lists
interface SwipeableCardProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function SwipeableCard({
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  children,
  className,
  disabled = false,
}: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const touchStartX = React.useRef<number>(0);
  const maxSwipe = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging) return;

    const touch = e.touches[0];
    if (!touch) return;
    const touchX = touch.clientX;
    const deltaX = touchX - touchStartX.current;
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));

    setSwipeOffset(clampedDelta);
  };

  const handleTouchEnd = () => {
    if (disabled) return;

    setIsDragging(false);

    if (Math.abs(swipeOffset) > maxSwipe * 0.6) {
      if (swipeOffset > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    setSwipeOffset(0);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background actions */}
      {leftAction && (
        <div className="absolute top-0 bottom-0 left-0 flex items-center justify-start bg-green-500 pl-4 text-white">
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div className="absolute top-0 right-0 bottom-0 flex items-center justify-end bg-red-500 pr-4 text-white">
          {rightAction}
        </div>
      )}

      {/* Card content */}
      <div
        className={cn(
          "bg-background relative transition-transform duration-200 ease-out",
          isDragging ? "duration-0" : "",
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export { SwipeGesture, LongPress, DoubleTap, PullToRefresh, SwipeableCard };
