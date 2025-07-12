import { useLayoutEffect, useState } from "react";

export const useResizer = () => {
  const [ref, setRef] = useState<HTMLButtonElement | null>(null);
  const [size, setTriggerSize] = useState(0);

  useLayoutEffect(() => {
    if (!ref) return;

    const updateSize = () => {
      setTriggerSize(ref.getBoundingClientRect().width + 1);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref]);

  return { ref, size, setRef };
};
