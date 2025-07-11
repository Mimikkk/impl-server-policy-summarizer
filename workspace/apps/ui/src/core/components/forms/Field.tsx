import { Show } from "@components/utility/Show.tsx";
import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { Fieldset, Legend } from "@headlessui/react";
import cx from "clsx";
import { type HTMLAttributes, memo } from "react";
import { uiElementClass } from "../../utilities/uiElementClass.tsx";

export interface FieldProps extends HTMLAttributes<HTMLFieldSetElement> {
  color?: ColorName;
  variant?: "solid" | "text";
  label?: string;
}

export const Field = memo(
  function Field({ id, label, children, color = "primary", variant = "solid", className, ...props }: FieldProps) {
    return (
      <Fieldset {...props} className={cx("relative rounded-xs", uiElementClass({ color, variant }), className)}>
        <Show when={label}>
          <Legend
            htmlFor={id}
            className={`absolute -top-1.5 left-2 text-xs px-1 rounded-xs  bg-${color}-2 text-${color}-11`}
          >
            {label}
          </Legend>
        </Show>
        {children}
      </Fieldset>
    );
  },
);
