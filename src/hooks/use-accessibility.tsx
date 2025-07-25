"use client";

/**
 * Comprehensive accessibility hook for components
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  FocusManager,
  ScreenReaderUtils,
  useKeyboardNavigation,
  useFocusManagement,
  useAriaLiveRegion,
  generateAccessibleId,
  type AriaAttributes,
  type KeyboardKey,
  KEYBOARD_KEYS
} from '@/lib/accessibility';

interface UseAccessibilityOptions {
  // Component identification
  role?: AriaAttributes['role'];
  label?: string;
  description?: string;
  
  // Keyboard navigation
  enableKeyboardNavigation?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowKeys?: (key: KeyboardKey) => void;
  
  // Focus management
  manageFocus?: boolean;
  isOpen?: boolean;
  
  // Live regions
  enableLiveRegion?: boolean;
  
  // State management
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
  pressed?: boolean;
  checked?: boolean | 'mixed';
  invalid?: boolean;
  required?: boolean;
  
  // Relationships
  controls?: string;
  describedBy?: string[];
  labelledBy?: string[];
  owns?: string;
  
  // Custom announcements
  announcements?: {
    onMount?: string;
    onUpdate?: string;
    onUnmount?: string;
  };
}

export function useAccessibility<T extends HTMLElement>(options: UseAccessibilityOptions = {}) {
  const {
    role,
    label,
    description,
    enableKeyboardNavigation = false,
    trapFocus = false,
    autoFocus = false,
    onEscape,
    onEnter,
    onArrowKeys,
    manageFocus = false,
    isOpen = false,
    enableLiveRegion = false,
    disabled = false,
    expanded,
    selected,
    pressed,
    checked,
    invalid = false,
    required = false,
    controls,
    describedBy = [],
    labelledBy = [],
    owns,
    announcements,
  } = options;

  // Refs
  const containerRef = useRef<T>(null);
  const [componentId] = useState(() => generateAccessibleId('component'));
  const [labelId] = useState(() => generateAccessibleId('label'));
  const [descriptionId] = useState(() => generateAccessibleId('description'));

  // Live region for announcements
  const { announce, LiveRegion } = useAriaLiveRegion();

  // Keyboard navigation
  useKeyboardNavigation(containerRef, {
    onEscape,
    onEnter,
    onArrowKeys,
    trapFocus: enableKeyboardNavigation && trapFocus,
    autoFocus: enableKeyboardNavigation && autoFocus,
  });

  // Focus management for modals/dialogs
  useFocusManagement(manageFocus && isOpen, containerRef);

  // Handle announcements
  useEffect(() => {
    if (announcements?.onMount) {
      announce(announcements.onMount);
    }
    
    return () => {
      if (announcements?.onUnmount) {
        announce(announcements.onUnmount);
      }
    };
  }, [announce, announcements?.onMount, announcements?.onUnmount]);

  useEffect(() => {
    if (announcements?.onUpdate) {
      announce(announcements?.onUpdate);
    }
  }, [announce, announcements?.onUpdate]);

  // Build ARIA attributes
  const ariaAttributes: AriaAttributes = {
    id: componentId,
    role,
    'aria-label': label,
    'aria-labelledby': labelledBy.length > 0 ? labelledBy.join(' ') : (label ? undefined : labelId),
    'aria-describedby': [
      description ? descriptionId : null,
      ...describedBy
    ].filter(Boolean).join(' ') || undefined,
    'aria-disabled': disabled,
    'aria-expanded': expanded,
    'aria-selected': selected,
    'aria-pressed': pressed,
    'aria-checked': checked,
    'aria-invalid': invalid,
    'aria-required': required,
    'aria-controls': controls,
    'aria-owns': owns,
  };

  // Clean up undefined values
  Object.keys(ariaAttributes).forEach(key => {
    if (ariaAttributes[key as keyof AriaAttributes] === undefined) {
      delete ariaAttributes[key as keyof AriaAttributes];
    }
  });

  // Helper functions
  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      const firstFocusable = FocusManager.getFocusableElements(containerRef.current)[0];
      firstFocusable?.focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = FocusManager.getFocusableElements(containerRef.current);
      const lastFocusable = focusableElements[focusableElements.length - 1];
      lastFocusable?.focus();
    }
  }, []);

  const focusNext = useCallback(() => {
    if (containerRef.current && document.activeElement) {
      const next = FocusManager.getNextFocusableElement(
        containerRef.current,
        document.activeElement as HTMLElement,
        'next'
      );
      next?.focus();
    }
  }, []);

  const focusPrevious = useCallback(() => {
    if (containerRef.current && document.activeElement) {
      const previous = FocusManager.getNextFocusableElement(
        containerRef.current,
        document.activeElement as HTMLElement,
        'previous'
      );
      previous?.focus();
    }
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, [announce]);

  // Label and description components
  const Label = useCallback(({ children, ...props }: React.HTMLAttributes<HTMLLabelElement>) => (
    <label id={labelId} {...props}>
      {children}
    </label>
  ), [labelId]);

  const Description = useCallback(({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div id={descriptionId} {...props}>
      {children}
    </div>
  ), [descriptionId]);

  return {
    // Refs
    containerRef,
    
    // IDs
    componentId,
    labelId,
    descriptionId,
    
    // ARIA attributes
    ariaAttributes,
    
    // Focus management
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    
    // Announcements
    announceToScreenReader,
    
    // Components
    Label,
    Description,
    LiveRegion: enableLiveRegion ? LiveRegion : null,
    
    // Utilities
    getFocusableElements: () => containerRef.current ? FocusManager.getFocusableElements(containerRef.current) : [],
  };
}

// Specialized hooks for common patterns

export function useAccessibleButton(options: {
  label: string;
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  disabled?: boolean;
  onActivate?: () => void;
} = { label: '' }) {
  const { label, pressed, expanded, controls, disabled, onActivate } = options;
  
  const accessibility = useAccessibility({
    role: 'button',
    label,
    pressed,
    expanded,
    controls,
    disabled,
    enableKeyboardNavigation: true,
    onEnter: onActivate,
  });

  const buttonProps = {
    ...accessibility.ariaAttributes,
    ref: accessibility.containerRef,
    disabled,
    onClick: onActivate,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.SPACE) {
        event.preventDefault();
        onActivate?.();
      }
    },
  };

  return {
    ...accessibility,
    buttonProps,
  };
}

export function useAccessibleDialog(options: {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
} = { isOpen: false }) {
  const { isOpen, onClose, title, description } = options;
  
  const accessibility = useAccessibility({
    role: 'dialog',
    label: title,
    description,
    enableKeyboardNavigation: true,
    trapFocus: true,
    autoFocus: true,
    manageFocus: true,
    isOpen,
    onEscape: onClose,
    announcements: {
      onMount: title ? `Dialog opened: ${title}` : 'Dialog opened',
      onUnmount: 'Dialog closed',
    },
  });

  return accessibility;
}

export function useAccessibleMenu(options: {
  isOpen: boolean;
  onClose?: () => void;
  orientation?: 'horizontal' | 'vertical';
} = { isOpen: false, orientation: 'vertical' }) {
  const { isOpen, onClose, orientation } = options;
  
  const accessibility = useAccessibility({
    role: 'menu',
    enableKeyboardNavigation: true,
    trapFocus: true,
    manageFocus: true,
    isOpen,
    onEscape: onClose,
    onArrowKeys: (key) => {
      if (orientation === 'vertical') {
        if (key === KEYBOARD_KEYS.ARROW_DOWN) {
          accessibility.focusNext();
        } else if (key === KEYBOARD_KEYS.ARROW_UP) {
          accessibility.focusPrevious();
        }
      } else {
        if (key === KEYBOARD_KEYS.ARROW_RIGHT) {
          accessibility.focusNext();
        } else if (key === KEYBOARD_KEYS.ARROW_LEFT) {
          accessibility.focusPrevious();
        }
      }
    },
  });

  return accessibility;
}

export function useAccessibleForm(options: {
  onSubmit?: () => void;
} = {}) {
  const { onSubmit } = options;
  
  const accessibility = useAccessibility({
    role: 'form',
    enableKeyboardNavigation: true,
    onEnter: onSubmit,
  });

  return accessibility;
}

export function useAccessibleGrid<T extends HTMLElement>(options: {
  rowCount: number;
  columnCount: number;
  onCellSelect?: (row: number, col: number) => void;
} = { rowCount: 0, columnCount: 0 }) {
  const { rowCount, columnCount, onCellSelect } = options;
  const [currentCell, setCurrentCell] = useState({ row: 0, col: 0 });
  
  const accessibility = useAccessibility<T>({
    role: 'grid',
    enableKeyboardNavigation: true,
    onArrowKeys: (key) => {
      let newRow = currentCell.row;
      let newCol = currentCell.col;
      
      switch (key) {
        case KEYBOARD_KEYS.ARROW_UP:
          newRow = Math.max(0, currentCell.row - 1);
          break;
        case KEYBOARD_KEYS.ARROW_DOWN:
          newRow = Math.min(rowCount - 1, currentCell.row + 1);
          break;
        case KEYBOARD_KEYS.ARROW_LEFT:
          newCol = Math.max(0, currentCell.col - 1);
          break;
        case KEYBOARD_KEYS.ARROW_RIGHT:
          newCol = Math.min(columnCount - 1, currentCell.col + 1);
          break;
      }
      
      if (newRow !== currentCell.row || newCol !== currentCell.col) {
        setCurrentCell({ row: newRow, col: newCol });
        onCellSelect?.(newRow, newCol);
      }
    },
  });

  return {
    ...accessibility,
    currentCell,
    setCurrentCell,
  };
}