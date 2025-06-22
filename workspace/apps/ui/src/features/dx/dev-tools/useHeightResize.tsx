import { useCallback, useEffect, useState } from "react";

export interface UseHeightResizeOptions {
  ref: HTMLDivElement | null;
  initial?: number;
  max?: number;
  min?: number;
}

export const useHeightResize = (
  { ref, initial = 300, max = 600, min = 100 }: UseHeightResizeOptions,
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [height, setHeight] = useState(initial);

  const handleStart = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newHeight = globalThis.innerHeight - e.clientY;
    setHeight(Math.max(min, Math.min(max, newHeight)));
  }, [isDragging, min, max]);

  const handleStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleReset = useCallback(() => {
    setHeight(initial);
  }, [initial]);

  useEffect(() => {
    if (isDragging) {
      // Prevent text selection during drag
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleStop);
      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleStop);
        // Restore text selection and cursor
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isDragging, handleMove, handleStop]);

  useEffect(() => {
    if (!ref) return;
    ref.addEventListener("mousedown", handleStart);
    ref.addEventListener("dblclick", handleReset);

    return () => {
      ref.removeEventListener("mousedown", handleStart);
      ref.removeEventListener("dblclick", handleReset);
    };
  }, [ref, handleStart, handleReset]);

  return { height, isDragging };
};
