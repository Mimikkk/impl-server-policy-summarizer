import { useEffect, useState } from "react";

interface UseResponsiveValueOptions<T> {
  xl: T;
  lg: T;
  md: T;
  sm: T;
  xs: T;
}
export const useResponsiveValue = <T,>(options: UseResponsiveValueOptions<T>) => {
  const [value, setValue] = useState(options.xs);

  useEffect(() => {
    const update = () => {
      const width = globalThis.innerWidth;

      if (width >= 1280) {
        setValue(options.xl);
      } else if (width >= 1024) {
        setValue(options.lg);
      } else if (width >= 768) {
        setValue(options.md);
      } else if (width >= 640) {
        setValue(options.sm);
      } else {
        setValue(options.xs);
      }
    };

    update();
    globalThis.addEventListener("resize", update);
    return () => globalThis.removeEventListener("resize", update);
  }, []);

  return value;
};
