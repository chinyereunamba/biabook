/**
 * Mobile-First Design System Tokens
 *
 * This file exports design system tokens for use in TypeScript/React components.
 * These tokens correspond to the CSS custom properties defined in design-system.css
 */

// Spacing tokens (4px base grid)
export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

// Typography tokens with fluid scaling
export const typography = {
  size: {
    xs: "var(--ds-text-xs)", // clamp(12px, 14px)
    sm: "var(--ds-text-sm)", // clamp(14px, 16px)
    base: "var(--ds-text-base)", // clamp(16px, 18px)
    lg: "var(--ds-text-lg)", // clamp(18px, 20px)
    xl: "var(--ds-text-xl)", // clamp(20px, 24px)
    "2xl": "var(--ds-text-2xl)", // clamp(24px, 30px)
    "3xl": "var(--ds-text-3xl)", // clamp(30px, 36px)
    "4xl": "var(--ds-text-4xl)", // clamp(36px, 48px)
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

// Color tokens optimized for mobile accessibility
export const colors = {
  primary: {
    50: "var(--ds-color-primary-50)",
    100: "var(--ds-color-primary-100)",
    200: "var(--ds-color-primary-200)",
    300: "var(--ds-color-primary-300)",
    400: "var(--ds-color-primary-400)",
    500: "var(--ds-color-primary-500)", // Main brand color
    600: "var(--ds-color-primary-600)",
    700: "var(--ds-color-primary-700)",
    800: "var(--ds-color-primary-800)",
    900: "var(--ds-color-primary-900)",
  },
  neutral: {
    0: "var(--ds-color-neutral-0)",
    50: "var(--ds-color-neutral-50)",
    100: "var(--ds-color-neutral-100)",
    200: "var(--ds-color-neutral-200)",
    300: "var(--ds-color-neutral-300)",
    400: "var(--ds-color-neutral-400)",
    500: "var(--ds-color-neutral-500)",
    600: "var(--ds-color-neutral-600)",
    700: "var(--ds-color-neutral-700)",
    800: "var(--ds-color-neutral-800)",
    900: "var(--ds-color-neutral-900)",
  },
  success: {
    50: "var(--ds-color-success-50)",
    500: "var(--ds-color-success-500)",
    600: "var(--ds-color-success-600)",
  },
  warning: {
    50: "var(--ds-color-warning-50)",
    500: "var(--ds-color-warning-500)",
    600: "var(--ds-color-warning-600)",
  },
  error: {
    50: "var(--ds-color-error-50)",
    500: "var(--ds-color-error-500)",
    600: "var(--ds-color-error-600)",
  },
} as const;

// Shadow tokens for mobile depth
export const shadows = {
  xs: "var(--ds-shadow-xs)",
  sm: "var(--ds-shadow-sm)",
  md: "var(--ds-shadow-md)",
  lg: "var(--ds-shadow-lg)",
  xl: "var(--ds-shadow-xl)",
} as const;

// Border radius tokens
export const radius = {
  none: "0",
  sm: "var(--ds-radius-sm)", // 4px
  md: "var(--ds-radius-md)", // 6px
  lg: "var(--ds-radius-lg)", // 8px
  xl: "var(--ds-radius-xl)", // 12px
  "2xl": "var(--ds-radius-2xl)", // 16px
  full: "var(--ds-radius-full)",
} as const;

// Transition tokens
export const transitions = {
  fast: "var(--ds-transition-fast)", // 150ms
  normal: "var(--ds-transition-normal)", // 200ms
  slow: "var(--ds-transition-slow)", // 300ms
} as const;

// Breakpoint tokens (mobile-first)
export const breakpoints = {
  sm: 640, // Small devices
  md: 768, // Medium devices (tablets)
  lg: 1024, // Large devices (desktops)
  xl: 1280, // Extra large devices
  "2xl": 1536, // 2X large devices
} as const;

// Touch target tokens (iOS/Android guidelines)
export const touchTargets = {
  min: "var(--ds-touch-min)", // 44px - iOS minimum
  comfortable: "var(--ds-touch-comfortable)", // 48px - Comfortable
  large: "var(--ds-touch-large)", // 56px - Large
} as const;

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Component variant configurations
export const componentVariants = {
  button: {
    size: {
      sm: {
        height: touchTargets.min,
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.size.sm,
      },
      md: {
        height: touchTargets.comfortable,
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.size.base,
      },
      lg: {
        height: touchTargets.large,
        padding: `${spacing[4]} ${spacing[8]}`,
        fontSize: typography.size.lg,
      },
    },
    variant: {
      primary: {
        backgroundColor: colors.primary[500],
        color: colors.neutral[0],
        "&:hover": {
          backgroundColor: colors.primary[600],
        },
      },
      secondary: {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[900],
        border: `1px solid ${colors.neutral[300]}`,
        "&:hover": {
          backgroundColor: colors.neutral[200],
          borderColor: colors.neutral[400],
        },
      },
    },
  },
  input: {
    size: {
      sm: {
        height: touchTargets.min,
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: typography.size.sm,
      },
      md: {
        height: touchTargets.comfortable,
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.size.base,
      },
      lg: {
        height: touchTargets.large,
        padding: `${spacing[4]} ${spacing[5]}`,
        fontSize: typography.size.lg,
      },
    },
    state: {
      default: {
        borderColor: colors.neutral[300],
        backgroundColor: colors.neutral[0],
      },
      focus: {
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
      },
      error: {
        borderColor: colors.error[500],
        boxShadow: `0 0 0 3px ${colors.error[50]}`,
      },
      success: {
        borderColor: colors.success[500],
        boxShadow: `0 0 0 3px ${colors.success[50]}`,
      },
    },
  },
} as const;

// Utility functions for responsive design
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]}px)`,
} as const;

// Mobile-first responsive utilities
export const responsive = {
  container: {
    mobile: {
      width: "100%",
      paddingLeft: spacing[4],
      paddingRight: spacing[4],
    },
    tablet: {
      maxWidth: `${breakpoints.md}px`,
      paddingLeft: spacing[6],
      paddingRight: spacing[6],
    },
    desktop: {
      maxWidth: `${breakpoints.lg}px`,
      paddingLeft: spacing[8],
      paddingRight: spacing[8],
    },
  },
  grid: {
    mobile: {
      display: "grid",
      gap: spacing[4],
      gridTemplateColumns: "1fr",
    },
    tablet: {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: spacing[6],
    },
    desktop: {
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: spacing[8],
    },
  },
} as const;

// Export all tokens as a single object for convenience
export const designSystem = {
  spacing,
  typography,
  colors,
  shadows,
  radius,
  transitions,
  breakpoints,
  touchTargets,
  zIndex,
  componentVariants,
  mediaQueries,
  responsive,
} as const;

export default designSystem;
