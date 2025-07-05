export type ColorShade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ColorName = "primary" | "secondary" | "info" | "success" | "warning" | "error";
export type ColorType = "bg" | "text" | "outline" | "border" | "ring" | "shadow" | "fill" | "stroke";

const shades: ColorShade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const names: ColorName[] = ["primary", "secondary", "info", "success", "warning", "error"];
export const colors = { names, shades };
