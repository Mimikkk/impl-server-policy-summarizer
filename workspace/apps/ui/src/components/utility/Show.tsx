import { memo } from "react";

export type ShowProps = {
  when: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const Show = memo(
  function Show({ when, children, fallback = false }: ShowProps) {
    return when ? <>{children}</> : fallback;
  },
);
