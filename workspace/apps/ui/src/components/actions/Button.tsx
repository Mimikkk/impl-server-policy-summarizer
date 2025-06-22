import { Button as ButtonHeadless } from "@headlessui/react";
import cx from "clsx";
import { memo } from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = memo(function Button({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <ButtonHeadless
      type="button"
      {...props}
      className={cx(
        "bg-primary-5 hover:bg-primary-6 active:bg-primary-4 border-accent-5 hover:border-accent-6 active:border-accent-4 border transition-colors text-primary-light px-1 rounded-sm rounded-l-none absolute bottom-0 left-0 cursor-pointer",
        className,
      )}
    >
      {children}
    </ButtonHeadless>
  );
});
