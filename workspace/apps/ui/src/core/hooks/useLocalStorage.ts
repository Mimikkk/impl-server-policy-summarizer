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

export interface ParamOptions<T> {
  key: string;
  serialize: (value: T) => string;
  deserialize: (value: string | null) => T;
}

export interface ParamUseOptions<T> {
  key?: string;
}

export class Param<T> {
  static new<T>(options: ParamOptions<T>): Param<T> {
    return new Param(options.key, options.serialize, options.deserialize);
  }

  private constructor(
    public readonly key: string,
    private readonly serialize: (value: T) => string,
    private readonly deserialize: (value: string | null) => T,
  ) {}

  static boolean({ key }: { key: string }): Param<boolean> {
    return Param.new({
      key,
      serialize: (value) => value.toString(),
      deserialize: (value) => value === "true",
    });
  }

  static object<T>({ key }: { key: string }): Param<T> {
    return Param.new({
      key,
      serialize: (value) => JSON.stringify(value),
      deserialize: (value) => value ? JSON.parse(value) : undefined,
    });
  }

  use(options?: ParamUseOptions<T>) {
    const key = options?.key ?? this.key;
    const [value, setValue] = useState(() => this.deserialize(LocalStorageService.get(key)));

    useEventListener(
      "local-storage",
      useCallback((event) => {
        if (event.detail.key !== key) return;

        setValue(this.deserialize(event.detail.newValue));
      }, [key, this.deserialize]),
    );

    useEffect(() => {
      LocalStorageService.set(key, this.serialize(value));
    }, [key, this.serialize, value]);

    return [value, setValue] as const;
  }
}
