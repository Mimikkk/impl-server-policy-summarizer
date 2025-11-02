import { useMemo, useRef } from "react";
import equals from "react-fast-compare";

export const useCompare = <T>(value: T, isEqual: (a: T, b: T) => boolean = equals) => {
  const ref = useRef<T>(value);
  const signalRef = useRef<number>(0);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  return useMemo(() => ref.current, [signalRef.current]);
};
