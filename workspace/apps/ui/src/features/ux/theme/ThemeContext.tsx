import { defineContext } from "@utilities/defineContext.ts";
import { useEffect, useMemo } from "react";
import { ThemeService } from "./ThemeService.tsx";

export interface ThemeContextProps {
  storage: string;
}

export const ThemeContext = defineContext(({ storage }: ThemeContextProps) => {
  const [mode, setMode] = ThemeService.param.use({ key: storage });

  const theme = useMemo(
    () => mode === "system" ? globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : mode,
    [mode],
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return { theme, mode, setMode };
});
