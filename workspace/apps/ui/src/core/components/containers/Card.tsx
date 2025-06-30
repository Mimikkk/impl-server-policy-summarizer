import cx from "clsx";
import { memo, PropsWithChildren } from "react";

export interface CardProps extends PropsWithChildren {
  className?: string;
  center?: boolean;
}

export const Card = memo(function Card({ children, className, center }: CardProps) {
  return (
    <div
      className={cx(
        "bg-secondary-light rounded-sm border border-accent-5 active:border-accent-4 hover:border-accent-4",
        center && "flex items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
});
