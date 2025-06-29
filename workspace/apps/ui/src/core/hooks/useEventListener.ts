import { useEffect } from "react";

export const useEventListener = <K extends keyof WindowEventMap>(
  event: K,
  listener: (event: WindowEventMap[K]) => void,
) => {
  useEffect(() => {
    globalThis.addEventListener(event, listener);

    return () => {
      globalThis.removeEventListener(event, listener);
    };
  }, [event, listener]);
};
