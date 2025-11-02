import { useEffect, useRef } from "react";

export const useUpdateEffect: typeof useEffect = (effect, deps) => {
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    effect();
  }, deps);
};
