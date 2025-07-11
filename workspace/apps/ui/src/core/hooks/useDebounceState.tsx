import { useCallback, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

export const useDebounceState = <T,>(initial: T, onChange: (value: T) => void, debounceMs = 200) => {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(initial);
  }, [initial]);
  const search = useDebounceCallback(onChange, debounceMs);
  const handleChange = useCallback(
    (value: T) => {
      setValue(value);
      search(value);
    },
    [search],
  );
  return [value, handleChange] as const;
};
