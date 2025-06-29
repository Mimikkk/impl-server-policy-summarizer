import cx from "clsx";
import { memo, type PropsWithChildren } from "react";

interface ErrorProps extends PropsWithChildren {
  theme: "dark" | "light";
}
export const DisplayError = memo(function DisplayError({ theme, children }: ErrorProps) {
  return (
    <div
      className={cx(
        "w-full h-full flex items-center justify-center",
        theme === "dark" ? "text-danger-dark" : "text-danger-light",
      )}
    >
      {children}
    </div>
  );
});
