import { memo } from "react";
import cx from "clsx";

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Loader = memo(function Loader({ size = "md", className }: LoaderProps) {
  return (
    <div className={cx("flex items-center justify-center", className)}>
      <div
        className={cx(
          "animate-spin rounded-full border-2 border-primary-3 border-t-primary-6",
          sizes[size],
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
});
