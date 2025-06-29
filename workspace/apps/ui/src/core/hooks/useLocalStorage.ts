import { LocalStorageService } from "@services/LocalStorageService.ts";
import { useCallback, useEffect, useState } from "react";
import { useEventListener } from "./useEventListener.ts";

export interface LocalStorageOptions<T = string> {
  key: string;
  serialize: (value: T) => string;
  deserialize: (value: string | null) => T;
}

export const createLocalStorageOptions = <T>({ key, serialize, deserialize }: LocalStorageOptions<T>) => ({
  key,
  serialize,
  deserialize,
});

export const useLocalStorage = <T>({ key, serialize, deserialize }: LocalStorageOptions<T>) => {
  const [value, setValue] = useState(() => deserialize(LocalStorageService.get(key)));

  useEventListener(
    "local-storage",
    useCallback((event) => {
      if (event.detail.key !== key) return;

      setValue(deserialize(event.detail.newValue));
    }, [key, deserialize]),
  );

  useEffect(() => {
    LocalStorageService.set(key, serialize(value));
  }, [key, serialize, value]);

  return [value, setValue] as const;
};
