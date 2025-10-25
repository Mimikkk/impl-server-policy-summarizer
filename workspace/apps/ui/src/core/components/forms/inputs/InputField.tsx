import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { useDebounceState } from "@hooks/useDebounceState.tsx";
import { noop } from "@tanstack/react-query";
import clsx from "clsx";
import { type ChangeEvent, type InputHTMLAttributes, memo, useCallback } from "react";
import { Field } from "../Field.tsx";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: ColorName;
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
  as?: "input" | "textarea";
}
export const InputField = memo(
  function InputField(
    { id, label, onValueChange, className, color, disabled, compact, as: As = "input", ...props }: InputFieldProps,
  ) {
    const [value, setValue] = useDebounceState(props.value ?? "", onValueChange ?? noop);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      event.preventDefault();

      setValue(event.target.value);
    }, [setValue]);

    return (
      <Field id={id} label={label} className={className} color={color} disabled={disabled}>
        <As
          id={id}
          {...props}
          value={value}
          onChange={handleChange}
          className={clsx(
            "outline-none w-full h-full px-3 text-ellipsis",
            compact ? "h-7" : "py-2",
            As === "textarea" ? "focus:min-h-24 resize-none" : "",
          )}
          disabled={disabled}
        />
      </Field>
    );
  },
);
