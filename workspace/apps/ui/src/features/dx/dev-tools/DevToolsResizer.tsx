import { memo, type Ref } from "react";

export const DevToolsResizer = memo<{ ref: Ref<HTMLDivElement> }>(function DevToolsResizer({ ref }) {
  return (
    <div
      ref={ref}
      className="absolute top-0 right-0 left-0 -mt-2 h-2 cursor-ns-resize border-t border-primary-7 bg-primary-3 transition-colors duration-100 hover:border-primary-8 hover:bg-primary-4 active:border-primary-8 active:bg-primary-5"
    />
  );
});
