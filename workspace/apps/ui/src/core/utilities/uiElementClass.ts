import type { ColorName } from "@features/ux/theme/ColorPalette.ts";

export interface UIOptions {
  color: ColorName;
  light?: boolean;
  variant?: "solid" | "text";
  interactive?: boolean;
  usesDisabled?: boolean;
  disabled?: boolean;
  active?: boolean;
  square?: boolean;
  group?: boolean;
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
        text-{{color}}-{{is-light}}
        transition-colors duration-100
        bg-{{color}}-3
        border border-{{color}}-6
        `,
  text: `
        text-{{color}}-{{is-light}}
        transition-colors duration-100
        `,
};
export const uiElementClass = (
  {
    color,
    light = false,
    disabled = false,
    usesDisabled = false,
    variant = "solid",
    interactive = true,
    active = false,
    square = false,
    group = false,
  }: UIOptions,
) => {
  let template = variants[variant];

  if (group) {
    template += " not-last:rounded-r-none not-first:rounded-l-none ";
  }

  if (!square) {
    template += " rounded-sm ";
  }

  if (usesDisabled) {
    template += disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  }

  if (interactive) {
    if (!disabled) {
      template += " " + interactiveVariants[variant];
    }
  }

  if (active) {
    template += " bg-{{color}}-4";
  }

  const lightStr = light ? "11" : "12";
  return template
    .replaceAll("{{color}}", color)
    .replaceAll("{{is-light}}", lightStr);
};
