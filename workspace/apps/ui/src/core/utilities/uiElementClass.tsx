import type { ColorName } from "@features/ux/theme/ColorPalette.ts";

export interface UiElementParameters {
  color: ColorName;
  light?: boolean;
  variant?: "solid" | "text";
  usesDisabled?: boolean;
  disabled?: boolean;
}

const variants = {
  solid: `
        rounded-xs
        bg-{{color}}-3
        hover:bg-{{color}}-4
        active:bg-{{color}}-5
        border border-{{color}}-6
        focus-within:border-{{color}}-7
        active:border-{{color}}-7
        hover:border-{{color}}-8
        text-{{color}}-{{is-light}}
        transition-colors duration-100
        `,
  text: `
        rounded-sm
        hover:bg-{{color}}-4 active:bg-{{color}}-5
        text-{{color}}-{{is-light}}
        transition-colors duration-100
        `,
};
export const uiElementClass = (
  { color, light = false, disabled = false, usesDisabled = false, variant = "solid" }: UiElementParameters,
) => {
  let template = variants[variant];

  const lightStr = light ? "11" : "12";

  if (usesDisabled) {
    template += disabled ? `opacity-50 cursor-not-allowed` : `cursor-pointer`;
  }

  return template
    .replaceAll("{{color}}", color)
    .replaceAll("{{is-light}}", lightStr);
};
