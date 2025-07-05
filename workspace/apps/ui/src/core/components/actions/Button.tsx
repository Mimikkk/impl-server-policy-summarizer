import { type ColorName } from "@features/ux/theme/ColorPalette.ts";
import { Button as ButtonHeadless } from "@headlessui/react";
import cx from "clsx";
import { ButtonHTMLAttributes, forwardRef, memo } from "react";

type Variant = "text" | "solid";
const variants: Record<Variant, string> = {
  "text":
    "p-0 flex items-center justify-center hover:bg-primary-1 active:bg-primary-2 transition-colors rounded-sm text-primary-dark",
  "solid":
    "bg-primary-3 hover:bg-primary-5 active:bg-primary-3 border-secondary-4 hover:border-secondary-5 active:border-secondary-4 border transition-colors px-1 rounded-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ColorName;
  variant?: Variant;
}

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, variant = "solid", color = "primary", className, ...props }, ref) {
    return (
      <ButtonHeadless
        type="button"
        ref={ref}
        {...props}
        className={cx(
          variants[variant],
          `bg-${color}`,
          props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        {children}
      </ButtonHeadless>
    );
  },
));
