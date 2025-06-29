import { forwardRef, memo, type Ref } from "react";

export const DevToolsResizer = memo(
  forwardRef(function DevToolsResizer(_, ref: Ref<HTMLDivElement>) {
    return (
      <div
        ref={ref}
        className="absolute top-0 left-0 right-0 h-1 -mt-1 bg-primary-5 cursor-ns-resize hover:bg-primary-4 active:bg-primary-3 transition-colors"
      />
    );
  }),
);
