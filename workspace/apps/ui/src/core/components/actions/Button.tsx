import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { uiElementClass } from "@utilities/uiElementClass.tsx";
import cx from "clsx";
import { type ButtonHTMLAttributes, memo, type Ref } from "react";

type Variant = "text" | "solid";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  color?: ColorName;
  variant?: Variant;
  compact?: boolean;
  square?: boolean;
  as?: "button" | "span";
  active?: boolean;
}

export const Button = memo<ButtonProps>(function Button(
  {
    children,
    variant = "solid",
    color = "secondary",
    className,
    compact,
    as: As = "button",
    square = false,
    active,
    ...props
  },
) {
  return (
    <As
      type="button"
      {...props}
      className={cx(
        compact ? "min-h-5" : "min-h-7",
        "flex items-center justify-center gap-1 w-fit min-w-0",
        square ? "aspect-square shrink-0" : compact ? "px-1" : "px-2 py-1",
        uiElementClass({ variant, color, disabled: props.disabled, usesDisabled: true, active }),
        className,
      )}
    >
      {children}
    </As>
  );
});
