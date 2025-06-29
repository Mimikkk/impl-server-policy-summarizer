import { memo, type ReactNode } from "react";

export type ShowProps = {
  when: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export const Show = memo(
  function Show({ when, children, fallback = null }: ShowProps) {
    return when ? children : fallback;
  },
);
