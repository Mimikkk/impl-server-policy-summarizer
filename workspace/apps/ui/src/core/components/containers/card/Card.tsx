import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import { forwardRef, type HTMLAttributes, memo, type PropsWithChildren } from "react";
import { Text } from "../../typography/Text.tsx";
import { Show } from "../../utility/Show.tsx";

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  color?: ColorName;
  className?: string;
  label?: string;
  compact?: boolean;
  active?: boolean;
}

export const Card = memo(
  forwardRef<HTMLDivElement, CardProps>(
    function Card(
      { children, className, label, compact, color = "primary", active = false, ...props }: CardProps,
      ref,
    ) {
      return (
        <div
          ref={ref}
          data-active={active ? "" : undefined}
          {...props}
          className={cx(
            `
            relative
            bg-${color}-1
            border rounded-sm
            border-${color}-6 
            hover:border-${color}-10
            active:border-${color}-10
            shadow-sm
            transition-colors
            `,
            label && "mt-2",
            !compact && "p-4",
            className,
          )}
        >
          <Show when={label}>
            <Text
              light
              className={`absolute -top-2 left-2 bg-${color}-2 border-${color}-6 text-xs px-1 rounded-xs max-w-[calc(100%-1rem)] overflow-hidden text-ellipsis whitespace-nowrap`}
            >
              {label}
            </Text>
          </Show>
          {children}
        </div>
      );
    },
  ),
);
