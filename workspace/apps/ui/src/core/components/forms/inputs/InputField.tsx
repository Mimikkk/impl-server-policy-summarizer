import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { type ChangeEvent, type InputHTMLAttributes, memo, useCallback } from "react";
import { Field } from "../Field.tsx";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: ColorName;
  label?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}
export const InputField = memo(
  function InputField(
    { id, label, onValueChange, className, color, disabled, ...props }: InputFieldProps,
  ) {
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      onValueChange?.(event.target.value);
    }, [onValueChange]);

    return (
      <Field id={id} label={label} className={className} color={color} disabled={disabled}>
        <input
          id={id}
          {...props}
          onChange={handleChange}
          className="px-3 py-2 outline-none w-full"
          disabled={disabled}
        />
      </Field>
    );
  },
);
