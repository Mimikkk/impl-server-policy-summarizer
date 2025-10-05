import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import { type HTMLAttributes, memo, type PropsWithChildren } from "react";

interface TextProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  color?: ColorName;
  light?: boolean | null;
  className?: string;
  ellipsis?: boolean;
}
export const Text = memo(
  function Text({ color = "primary", light, children, className, ellipsis, ...props }: TextProps) {
    return (
      <span
        className={cx(
          `text-${color}-${light ? 11 : 12}`,
          className,
          ellipsis && "text-ellipsis overflow-hidden whitespace-nowrap",
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
