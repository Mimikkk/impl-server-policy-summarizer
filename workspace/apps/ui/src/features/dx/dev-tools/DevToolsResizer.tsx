import { memo, type Ref } from "react";

export const DevToolsResizer = memo<{ ref: Ref<HTMLDivElement> }>(function DevToolsResizer({ ref }) {
  return (
    <div
      ref={ref}
      className="
        absolute top-0 left-0 right-0 
        h-2 -mt-2 
        bg-primary-3 hover:bg-primary-4 active:bg-primary-5 
        border-t border-primary-7  hover:border-primary-8 active:border-primary-8
        cursor-ns-resize 
        transition-colors duration-100
        "
    />
  );
});
