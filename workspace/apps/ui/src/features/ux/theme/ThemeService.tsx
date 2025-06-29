export type ThemeMode = "light" | "dark" | "system";

export namespace ThemeService {
  const order: Record<ThemeMode, ThemeMode> = {
    light: "dark",
    dark: "system",
    system: "light",
  };

  export const next = (mode: ThemeMode) => order[mode];
}
