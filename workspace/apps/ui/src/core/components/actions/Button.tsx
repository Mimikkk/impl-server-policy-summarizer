import { type ColorName } from "@features/ux/theme/ColorPalette.ts";
import { Button as ButtonHeadless } from "@headlessui/react";
import { uiElementClass } from "@utilities/uiElementClass.tsx";
import cx from "clsx";
import { ButtonHTMLAttributes, forwardRef, memo } from "react";

type Variant = "text" | "solid";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ColorName;
  variant?: Variant;
  compact?: boolean;
}

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { children, variant = "solid", color = "secondary", className, compact = variant === "text", ...props },
    ref,
  ) {
    return (
      <ButtonHeadless
        type="button"
        ref={ref}
        {...props}
        className={cx(
          !compact && "px-2 py-1",
          "flex items-center justify-center",
          uiElementClass({ variant, color, disabled: props.disabled, usesDisabled: true }),
          className,
        )}
      >
        {children}
      </ButtonHeadless>
    );
  },
));
