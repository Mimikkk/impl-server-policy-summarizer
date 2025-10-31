import { Param } from "@hooks/useLocalStorage.ts";

export type ThemeMode = "light" | "dark" | "system";

export namespace ThemeService {
  const order: Record<ThemeMode, ThemeMode> = { light: "dark", dark: "system", system: "light" };
  const list = ["light", "dark", "system"] as const;

  export const param = Param.enum({ key: "theme-mode", list, defaultValue: "system" });
  export const next = (mode: ThemeMode) => order[mode];
}
