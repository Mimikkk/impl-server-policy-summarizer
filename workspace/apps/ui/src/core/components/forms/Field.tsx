import { Show } from "@components/utility/Show.tsx";
import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { uiElementClass } from "@utilities/uiElementClass.tsx";
import cx from "clsx";
import { type HTMLAttributes, memo } from "react";

export interface FieldProps extends HTMLAttributes<HTMLFieldSetElement> {
  color?: ColorName;
  variant?: "solid" | "text";
  label?: string;
  disabled?: boolean;
}

export const Field = memo(
  function Field(
    { id, label, children, color = "primary", variant = "solid", className, disabled, ...props }: FieldProps,
  ) {
    return (
      <fieldset
        {...props}
        className={cx(
          "min-w-0 relative rounded-xs",
          uiElementClass({ color, variant, disabled, usesDisabled: true }),
          className,
        )}
      >
        <Show when={label}>
          <label
            htmlFor={id}
            className={`absolute -top-2 left-2 text-xs px-1 rounded-xs bg-${color}-2 text-${color}-11`}
          >
            {label}
          </label>
        </Show>
        {children}
      </fieldset>
    );
  },
);
