import type { ColorName } from "@features/ux/theme/ColorPalette.ts";

export interface UiElementParameters {
  color: ColorName;
  light?: boolean;
  variant?: "solid" | "text";
  interactive?: boolean;
  usesDisabled?: boolean;
  disabled?: boolean;
}

const interactiveVariants = {
  solid: `
        hover:bg-{{color}}-4
        active:bg-{{color}}-5
        focus-within:border-{{color}}-7
        active:border-{{color}}-7
        hover:border-{{color}}-8
        `,
  text: `
        hover:bg-{{color}}-4
        active:bg-{{color}}-5
        `,
};

const variants = {
  solid: `
        rounded-sm
        text-{{color}}-{{is-light}}
        transition-colors duration-100
        bg-{{color}}-3
        border border-{{color}}-6
        `,
  text: `
        rounded-sm
        text-{{color}}-{{is-light}}
        transition-colors duration-100
        `,
};
export const uiElementClass = (
  { color, light = false, disabled = false, usesDisabled = false, variant = "solid", interactive = true }:
    UiElementParameters,
) => {
  let template = variants[variant];

  const lightStr = light ? "11" : "12";

  if (usesDisabled) {
    template += disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  }

  if (interactive) {
    if (!disabled) {
      template += " " + interactiveVariants[variant];
    }
  }

  return template
    .replaceAll("{{color}}", color)
    .replaceAll("{{is-light}}", lightStr);
};
