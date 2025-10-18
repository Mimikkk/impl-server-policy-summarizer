import { Loader } from "@components/badges/Loader.tsx";
import type { FetchStatus, QueryStatus } from "@tanstack/react-query";
import type { Nil } from "@utilities/common.ts";
import { memo, type PropsWithChildren, type ReactNode } from "react";

export type Status = QueryStatus | FetchStatus;

export interface StatusBarrierProps extends PropsWithChildren {
  status: Nil<Status>;
  error?: ReactNode;
  loading?: ReactNode;
}

export const StatusBarrier = memo(function StatusBarrier({ children, status, error, loading }: StatusBarrierProps) {
  switch (status) {
    case "success":
      return children;
    case "fetching":
    case "pending":
      return (
        <div className="w-full h-full flex gap-1 items-center justify-center">
          <Loader />
          {loading}
        </div>
      );
    case "error":
      return error;
    default:
      return children;
  }
});
