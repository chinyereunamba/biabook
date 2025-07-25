"use client";

/**
 * Accessibility utilities for ARIA attributes, keyboard navigation, and focus management
 */

import React, { useEffect, useRef, useCallback } from "react";

// ARIA role types for better type safety
export type AriaRole = 
  | "button" 
  | "dialog" 
  | "menu" 
  | "menuitem" 
  | "tab" 
  | "tabpanel" 
  | "tablist"
  | "grid"
  | "gridcell"
  | "row"
  | "columnheader"
  | "rowheader"
  | "listbox"
  | "option"
  | "combobox"
  | "textbox"
  | "checkbox"
  | "radio"
  | "radiogroup"
  | "slider"
  | "spinbutton"
  | "progressbar"
  | "alert"
  | "alertdialog"
  | "status"
  | "log"
  | "marquee"
  | "timer"
  | "tooltip"
  | "complementary"
  | "contentinfo"
  | "form"
  | "main"
  | "navigation"
  | "region"
  | "search"
  | "banner";

// Common ARIA attributes interface
export interface AriaAttributes {
  id?: string;
  role?: AriaRole;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-selected"?: boolean;
  "aria-checked"?: boolean | "mixed";
  "aria-pressed"?: boolean;
  "aria-current"?: boolean | "page" | "step" | "location" | "date" | "time";
  "aria-disabled"?: boolean;
  "aria-hidden"?: boolean;
  "aria-live"?: "off" | "polite" | "assertive";
  "aria-atomic"?: boolean;
  "aria-busy"?: boolean;
  "aria-controls"?: string;
  "aria-owns"?: string;
  "aria-activedescendant"?: string;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-invalid"?: boolean | "grammar" | "spelling";
  "aria-required"?: boolean;
  "aria-readonly"?: boolean;
  "aria-multiline"?: boolean;
  "aria-multiselectable"?: boolean;
  "aria-orientation"?: "horizontal" | "vertical";
  "aria-sort"?: "none" | "ascending" | "descending" | "other";
  "aria-valuemin"?: number;
  "aria-valuemax"?: number;
  "aria-valuenow"?: number;
  "aria-valuetext"?: string;
  "aria-setsize"?: number;
  "aria-posinset"?: number;
  "aria-level"?: number;
}

// Keyboard navigation keys
export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const;

export type KeyboardKey = typeof KEYBOARD_KEYS[keyof typeof KEYBOARD_KEYS];

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static pushFocus(element: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }

  static popFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  static trapFocus(container: HTMLElement, event: KeyboardEvent) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === KEYBOARD_KEYS.TAB) {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  static getNextFocusableElement(container: HTMLElement, current: HTMLElement, direction: 'next' | 'previous'): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(current);
    
    if (currentIndex === -1) return null;

    if (direction === 'next') {
      return focusableElements[currentIndex + 1] || focusableElements[0] || null;
    } else {
      return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1] || null;
    }
  }
}

// Screen reader utilities
export class ScreenReaderUtils {
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  static createScreenReaderOnly(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  }
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement | null>,
  options: {
    onEscape?: () => void;
    onEnter?: () => void;
    onArrowKeys?: (key: KeyboardKey) => void;
    trapFocus?: boolean;
    autoFocus?: boolean;
  } = {}
) {
  const { onEscape, onEnter, onArrowKeys, trapFocus = false, autoFocus = false } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (autoFocus) {
      const firstFocusable = FocusManager.getFocusableElements(container)[0];
      firstFocusable?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case KEYBOARD_KEYS.ESCAPE:
          onEscape?.();
          break;
        case KEYBOARD_KEYS.ENTER:
          onEnter?.();
          break;
        case KEYBOARD_KEYS.ARROW_UP:
        case KEYBOARD_KEYS.ARROW_DOWN:
        case KEYBOARD_KEYS.ARROW_LEFT:
        case KEYBOARD_KEYS.ARROW_RIGHT:
          onArrowKeys?.(event.key as KeyboardKey);
          break;
        default:
          break;
      }

      if (trapFocus) {
        FocusManager.trapFocus(container, event);
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, onEscape, onEnter, onArrowKeys, trapFocus, autoFocus]);
}

// Hook for focus management in modals/dialogs
export function useFocusManagement(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const firstFocusable = FocusManager.getFocusableElements(container)[0];
    if (firstFocusable) {
      FocusManager.pushFocus(firstFocusable);
    }

    // Return focus when component unmounts or closes
    return () => {
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, containerRef]);
}

// Hook for managing ARIA live regions
export function useAriaLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      ref={liveRegionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  ), []);

  return { announce, LiveRegion };
}

// Utility to generate accessible IDs
export function generateAccessibleId(prefix: string = 'accessible'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility to create accessible button props
export function createAccessibleButtonProps(
  label: string,
  options: {
    pressed?: boolean;
    expanded?: boolean;
    controls?: string;
    describedBy?: string;
    disabled?: boolean;
  } = {}
): AriaAttributes & { id: string } {
  const id = generateAccessibleId('button');
  
  return {
    id,
    role: 'button',
    'aria-label': label,
    'aria-pressed': options.pressed,
    'aria-expanded': options.expanded,
    'aria-controls': options.controls,
    'aria-describedby': options.describedBy,
    'aria-disabled': options.disabled,
  };
}

// Utility to create accessible form field props
export function createAccessibleFormFieldProps(
  label: string,
  options: {
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
    helpText?: string;
    errorMessage?: string;
  } = {}
): {
  fieldId: string;
  labelId: string;
  helpId?: string;
  errorId?: string;
  fieldProps: AriaAttributes;
  labelProps: AriaAttributes;
} {
  const fieldId = generateAccessibleId('field');
  const labelId = generateAccessibleId('label');
  const helpId = options.helpText ? generateAccessibleId('help') : undefined;
  const errorId = options.errorMessage ? generateAccessibleId('error') : undefined;

  const describedByIds = [
    options.describedBy,
    helpId,
    errorId
  ].filter(Boolean).join(' ') || undefined;

  return {
    fieldId,
    labelId,
    helpId,
    errorId,
    fieldProps: {
      id: fieldId,
      'aria-labelledby': labelId,
      'aria-describedby': describedByIds,
      'aria-required': options.required,
      'aria-invalid': options.invalid,
    },
    labelProps: {
      id: labelId,
    },
  };
}

// Color contrast utilities
export class ColorContrastUtils {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!hex) {
      return null;
    }
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result && result[1] && result[2] && result[3]
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }) as [number, number, number];
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  static meetsWCAGAA(foreground: string, background: string): boolean {
    return this.getContrastRatio(foreground, background) >= 4.5;
  }

  static meetsWCAGAAA(foreground: string, background: string): boolean {
    return this.getContrastRatio(foreground, background) >= 7;
  }
}
