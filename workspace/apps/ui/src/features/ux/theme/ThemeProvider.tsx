import { createLocalStorageOptions, useLocalStorage } from "@hooks/useLocalStorage.ts";
import { identity } from "@utilities/common.ts";
import { createContext } from "@utilities/createContext.tsx";
import { useCallback, useMemo } from "react";
import { type ThemeMode, ThemeService } from "./ThemeService.tsx";

const ThemeLocalStorageOptions = createLocalStorageOptions({
  key: "theme",
  serialize: identity<ThemeMode>,
  deserialize: (value) => (value ?? "system") as ThemeMode,
});

export const [useTheme, ThemeProvider] = createContext(function Theme() {
  const [mode, setMode] = useLocalStorage(ThemeLocalStorageOptions);

  const theme = useMemo(
    () => mode === "system" ? globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : mode,
    [mode],
  );

  const setNextMode = useCallback(() => setMode(ThemeService.next), []);

  return { theme, mode, setMode, setNextMode };
});
