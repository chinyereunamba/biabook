"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Hover effect variants
const hoverVariants = cva("transition-all duration-200 ease-in-out", {
  variants: {
    effect: {
      lift: "hover:transform hover:-translate-y-1 hover:shadow-lg",
      scale: "hover:scale-105 active:scale-95",
      glow: "hover:shadow-lg hover:shadow-primary/25",
      fade: "hover:opacity-80",
      slide: "hover:translate-x-1",
      bounce: "hover:animate-bounce",
      pulse: "hover:animate-pulse",
      none: "",
    },
    intensity: {
      subtle: "transition-all duration-150",
      normal: "transition-all duration-200",
      strong: "transition-all duration-300",
    },
  },
  defaultVariants: {
    effect: "lift",
    intensity: "normal",
  },
});

interface HoverEffectProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof hoverVariants> {
  disabled?: boolean;
}

function HoverEffect({
  className,
  effect,
  intensity,
  disabled = false,
  children,
  ...props
}: HoverEffectProps) {
  return (
    <div
      className={cn(
        hoverVariants({ effect: disabled ? "none" : effect, intensity }),
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Focus effect component
interface FocusEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ring" | "glow" | "outline";
  color?: "primary" | "secondary" | "success" | "warning" | "error";
}

function FocusEffect({
  className,
  variant = "ring",
  color = "primary",
  children,
  ...props
}: FocusEffectProps) {
  const focusClasses = {
    ring: {
      primary:
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
      secondary:
        "focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2",
      success:
        "focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2",
      warning:
        "focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2",
      error:
        "focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2",
    },
    glow: {
      primary: "focus-within:shadow-lg focus-within:shadow-primary/25",
      secondary: "focus-within:shadow-lg focus-within:shadow-secondary/25",
      success: "focus-within:shadow-lg focus-within:shadow-green-500/25",
      warning: "focus-within:shadow-lg focus-within:shadow-yellow-500/25",
      error: "focus-within:shadow-lg focus-within:shadow-red-500/25",
    },
    outline: {
      primary:
        "focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2",
      secondary:
        "focus-within:outline-2 focus-within:outline-secondary focus-within:outline-offset-2",
      success:
        "focus-within:outline-2 focus-within:outline-green-500 focus-within:outline-offset-2",
      warning:
        "focus-within:outline-2 focus-within:outline-yellow-500 focus-within:outline-offset-2",
      error:
        "focus-within:outline-2 focus-within:outline-red-500 focus-within:outline-offset-2",
    },
  };

  return (
    <div
      className={cn(
        "transition-all duration-200",
        focusClasses[variant][color],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Press effect for mobile interactions
interface PressEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  effect?: "scale" | "opacity" | "shadow" | "none";
  disabled?: boolean;
}

function PressEffect({
  className,
  effect = "scale",
  disabled = false,
  children,
  ...props
}: PressEffectProps) {
  const pressClasses = {
    scale: "active:scale-95 transition-transform duration-100",
    opacity: "active:opacity-70 transition-opacity duration-100",
    shadow: "active:shadow-inner transition-shadow duration-100",
    none: "",
  };

  return (
    <div
      className={cn(
        pressClasses[disabled ? "none" : effect],
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Ripple effect for touch interactions
interface RippleEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  duration?: number;
}

function RippleEffect({
  className,
  color = "rgba(255, 255, 255, 0.6)",
  duration = 600,
  children,
  onClick,
  ...props
}: RippleEffectProps) {
  const [ripples, setRipples] = React.useState<
    Array<{ x: number; y: number; id: number }>
  >([]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, duration);

    onClick?.(event);
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute animate-ping rounded-full"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Animated counter component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({
  value,
  duration = 1000,
  className,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setDisplayValue(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// Stagger animation for lists
interface StaggerAnimationProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

function StaggerAnimation({
  children,
  delay = 100,
  className,
}: StaggerAnimationProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * delay}ms`,
            animationFillMode: "both",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Slide transition component
interface SlideTransitionProps {
  show: boolean;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

function SlideTransition({
  show,
  direction = "up",
  duration = 300,
  children,
  className,
}: SlideTransitionProps) {
  const [shouldRender, setShouldRender] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const directionClasses = {
    up: show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
    down: show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
    left: show ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
    right: show ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
  };

  return (
    <div
      className={cn(
        "transition-all ease-in-out",
        directionClasses[direction],
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Fade transition component
interface FadeTransitionProps {
  show: boolean;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

function FadeTransition({
  show,
  duration = 200,
  children,
  className,
}: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "transition-opacity ease-in-out",
        show ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Scale transition component
interface ScaleTransitionProps {
  show: boolean;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

function ScaleTransition({
  show,
  duration = 200,
  children,
  className,
}: ScaleTransitionProps) {
  const [shouldRender, setShouldRender] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "origin-center transition-all ease-in-out",
        show ? "scale-100 opacity-100" : "scale-95 opacity-0",
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

export {
  HoverEffect,
  FocusEffect,
  PressEffect,
  RippleEffect,
  AnimatedCounter,
  StaggerAnimation,
  SlideTransition,
  FadeTransition,
  ScaleTransition,
  hoverVariants,
};
