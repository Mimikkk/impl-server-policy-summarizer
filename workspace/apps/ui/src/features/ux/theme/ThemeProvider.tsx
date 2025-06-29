import { createLocalStorageOptions, useLocalStorage } from "@hooks/useLocalStorage.ts";
import { identity } from "@utilities/common.ts";
import { createContext } from "@utilities/createContext.tsx";
import { useCallback, useMemo } from "react";
import { type ThemeMode, ThemeService } from "./ThemeService.tsx";

const createThemeLocalStorageOptions = (key: string) =>
  createLocalStorageOptions({
    key,
    serialize: identity<ThemeMode>,
    deserialize: (value) => (value ?? "system") as ThemeMode,
  });

export interface ThemeProviderProps {
  storage: string;
}

export const [useTheme, ThemeProvider] = createContext(function Theme({ storage }: ThemeProviderProps) {
  const [mode, setMode] = useLocalStorage(createThemeLocalStorageOptions(storage));

  const theme = useMemo(
    () => mode === "system" ? globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : mode,
    [mode],
  );

  const setNextMode = useCallback(() => setMode(ThemeService.next), []);

  return { theme, mode, setMode, setNextMode };
});
