"use client";

import { cx } from "@/utils/cx";
import type { PaginationRootProps } from "./pagination-base";
import { Pagination } from "./pagination-base";

interface PaginationDotProps extends Omit<PaginationRootProps, "children"> {
  /** The size of the pagination dot. */
  size?: "md" | "lg";
  /** Whether the pagination uses brand colors. */
  isBrand?: boolean;
  /** Whether the pagination is displayed in a card. */
  framed?: boolean;
}

export const PaginationDot = ({
  framed,
  className,
  size = "md",
  isBrand,
  ...props
}: PaginationDotProps) => {
  const sizes = {
    md: {
      root: cx("gap-3", framed && "p-0.5"),
      button: "h-2 w-2 after:-inset-x-1.5 after:-inset-y-2",
    },
    lg: {
      root: cx("gap-4", framed && "p-3"),
      button: "h-2.5 w-2.5 after:-inset-x-2 after:-inset-y-3",
    },
  };

  return (
    <Pagination.Root
      {...props}
      className={cx(
        "flex h-max w-max",
        sizes[size].root,
        framed && "bg-white/90 rounded-full backdrop-blur",
        className,
      )}
    >
      <Pagination.Context>
        {({ pages }) =>
          pages.map((page, index) =>
            page.type === "page" ? (
              <Pagination.Item
                {...page}
                asChild
                key={index}
                className={cx(
                  "bg-muted outline-focus-ring relative cursor-pointer rounded-full after:absolute focus-visible:outline-2 focus-visible:outline-offset-2",
                  sizes[size].button,
                  page.isCurrent && "bg-primary",
                  isBrand && "bg-primary",
                  isBrand && page.isCurrent && "bg-muted",
                )}
              ></Pagination.Item>
            ) : (
              <Pagination.Ellipsis {...page} key={index} />
            ),
          )
        }
      </Pagination.Context>
    </Pagination.Root>
  );
};
