import type React from "react";

type ReactComponent =
  | React.FC<Record<string, unknown>>
  | React.ComponentClass<Record<string, unknown>, Record<string, unknown>>;

/**
 * Checks if a given value is a function component.
 */
export const isFunctionComponent = (
  component: unknown,
): component is React.FC<Record<string, unknown>> => {
  return typeof component === "function";
};

/**
 * Checks if a given value is a class component.
 */
export const isClassComponent = (
  component: unknown,
): component is React.ComponentClass<
  Record<string, unknown>,
  Record<string, unknown>
> => {
  return (
    typeof component === "function" &&
    component.prototype &&
    (!!component.prototype.isReactComponent || !!component.prototype.render)
  );
};

/**
 * Checks if a given value is a forward ref component.
 */
export const isForwardRefComponent = (
  component: unknown,
): component is React.ForwardRefExoticComponent<Record<string, unknown>> => {
  return (
    typeof component === "object" &&
    component !== null &&
    (component as { $$typeof?: symbol }).$$typeof?.toString() ===
      "Symbol(react.forward_ref)"
  );
};

/**
 * Checks if a given value is a valid React component.
 */
export const isReactComponent = (
  component: unknown,
): component is ReactComponent => {
  return (
    isFunctionComponent(component) ||
    isForwardRefComponent(component) ||
    isClassComponent(component)
  );
};
