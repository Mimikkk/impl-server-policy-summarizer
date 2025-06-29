import { Button as ButtonHeadless } from "@headlessui/react";
import cx from "clsx";
import type { Ref } from "react";
import { forwardRef, memo } from "react";

type Variant = "text" | "solid";
const variants: Record<Variant, string> = {
  "solid":
    "bg-primary-5 hover:bg-primary-6 active:bg-primary-4 border-secondary-5 hover:border-secondary-6 active:border-secondary-4 border transition-colors px-1 rounded-sm",
  "text": "p-0 flex items-center justify-center hover:bg-primary-1 active:bg-primary-2 transition-colors rounded-sm",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = memo(forwardRef(function Button({
  children,
  variant = "solid",
  className,
  ...props
}: ButtonProps, ref: Ref<HTMLButtonElement>) {
  return (
    <ButtonHeadless
      type="button"
      ref={ref}
      {...props}
      className={cx(
        "cursor-pointer",
        variants[variant],
        className,
      )}
    >
      {children}
    </ButtonHeadless>
  );
}));
