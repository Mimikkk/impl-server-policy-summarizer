import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { uiElementClass } from "@utilities/uiElementClass.ts";
import cx from "clsx";
import { type ButtonHTMLAttributes, memo, type Ref } from "react";
import { ButtonGroupContext } from "./ButtonGroup.tsx";

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
  const isInButtonGroup = ButtonGroupContext.use();

  return (
    <As
      type="button"
      {...props}
      className={cx(
        compact ? "min-h-5" : "min-h-7",
        "flex items-center justify-center gap-1 min-w-0 w-auto",
        square ? "aspect-square shrink-0" : compact ? "px-1" : "px-2 py-1",
        uiElementClass({
          variant,
          color,
          disabled: props.disabled,
          usesDisabled: true,
          active,
          group: isInButtonGroup ? true : undefined,
        }),
        className,
      )}
    >
      {children}
    </As>
  );
});
