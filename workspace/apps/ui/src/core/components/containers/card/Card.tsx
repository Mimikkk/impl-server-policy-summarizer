import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import { memo, type PropsWithChildren } from "react";
import { Text } from "../../typography/Text.tsx";
import { Show } from "../../utility/Show.tsx";

export interface CardProps extends PropsWithChildren {
  color?: ColorName;
  className?: string;
  center?: boolean;
  label?: string;
  compact?: boolean;
  active?: boolean;
}

export const Card = memo(
  function Card({ children, className, center, label, compact, color = "primary", active = false }: CardProps) {
    return (
      <div
        data-active={active ? "" : undefined}
        className={cx(
          `
        relative
        bg-${color}-1
        border rounded-sm
        border-${color}-6 
        hover:border-${color}-10
        data-active:border-${color}-10
        shadow-sm
        transition-colors
        `,
          center && "flex items-center justify-center",
          label && "mt-2",
          !compact && "p-4",
          className,
        )}
      >
        <Show when={label}>
          <Text
            light
            className={`absolute -top-2 left-2 bg-${color}-2 border-${color}-6 text-xs px-1 rounded-xs`}
          >
            {label}
          </Text>
        </Show>
        {children}
      </div>
    );
  },
);
