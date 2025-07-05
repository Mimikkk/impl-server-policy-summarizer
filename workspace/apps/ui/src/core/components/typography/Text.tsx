import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import { type HTMLAttributes, memo, type PropsWithChildren } from "react";

interface TextProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  color?: ColorName;
  light?: boolean;
  className?: string;
}
export const Text = memo(function Text({ color = "primary", light, children, className }: TextProps) {
  return (
    <span className={cx(`text-${color}-${light ? 11 : 12}`, className)}>
      {children}
    </span>
  );
});
