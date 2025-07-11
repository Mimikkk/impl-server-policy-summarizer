import { type ColorName } from "@features/ux/theme/ColorPalette.ts";
import { Button as ButtonHeadless } from "@headlessui/react";
import cx from "clsx";
import { ButtonHTMLAttributes, forwardRef, memo } from "react";

type Variant = "text" | "solid";
const variantClass = (variant: Variant, color: ColorName) => {
  if (variant === "text") {
    return `
    flex items-center justify-center
    hover:bg-${color}-4 active:bg-${color}-5
    transition-colors duration-100
    rounded-sm
    `;
  }

  return `
    bg-${color}-3 hover:bg-${color}-4 active:bg-${color}-5
    border
    border-${color}-6 hover:border-${color}-8 active:border-${color}-7
    px-2
    transition-colors duration-100
    rounded-sm
    `;
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ColorName;
  variant?: Variant;
}

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, variant = "solid", color = "secondary", className, ...props }, ref) {
    return (
      <ButtonHeadless
        type="button"
        ref={ref}
        {...props}
        className={cx(
          variantClass(variant, color),
          props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        {children}
      </ButtonHeadless>
    );
  },
));
