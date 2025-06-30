import cx from "clsx";
import { memo, PropsWithChildren } from "react";

export interface CardProps extends PropsWithChildren {
  className?: string;
  center?: boolean;
  label?: string;
}

export const Card = memo(function Card({ children, className, center, label }: CardProps) {
  return (
    <div
      className={cx(
        "bg-secondary-light rounded-sm border border-accent-5 active:border-accent-4 hover:border-accent-4 relative",
        center && "flex items-center justify-center",
        className,
      )}
    >
      {label && (
        <div className="absolute -top-2 left-2 text-xs font-medium text-primary-7 bg-secondary-light px-2 rounded-sm">
          {label}
        </div>
      )}
      {children}
    </div>
  );
});
