import { useEffect, useRef } from "react";

export const useResizeObserver = ({ onChange, onStart }: {
  onStart?: (observer: ResizeObserver) => void;
  onChange: ResizeObserverCallback;
}) => {
  const ref = useRef<ResizeObserver>(null);

  useEffect(() => {
    const observer = new ResizeObserver(onChange);
    ref.current = observer;

    onStart?.(observer);
    return () => observer.disconnect();
  }, [onChange, onStart]);

  return ref;
};
