import { type ColorName } from "@features/ux/theme/ColorPalette.ts";
import { Button as ButtonHeadless } from "@headlessui/react";
import cx from "clsx";
import { ButtonHTMLAttributes, forwardRef, memo } from "react";

type Variant = "text" | "solid";
const variants: Record<Variant, string> = {
  "text": `
    px-2
    flex items-center justify-center
    hover:bg-{{color}}-4 active:bg-{{color}}-5
    transition-colors
    rounded-sm
    `,
  "solid": `
    bg-{{color}}-3 hover:bg-{{color}}-4 active:bg-{{color}}-5
    border-{{color}}-6 hover:border-{{color}}-8 active:border-{{color}}-7
    border
    px-2
    transition-colors
    rounded-sm
    `,
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
          variants[variant].replace("{{color}}", color),
          props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        {children}
      </ButtonHeadless>
    );
  },
));
