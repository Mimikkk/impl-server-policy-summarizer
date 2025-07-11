import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { Input } from "@headlessui/react";
import { type ChangeEvent, type InputHTMLAttributes, memo, useCallback } from "react";
import { Field } from "../Field.tsx";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  color?: ColorName;
  label?: string;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}
export const InputField = memo(
  function InputField(
    { id, label, onChange, onValueChange, className, color, ...props }: InputFieldProps,
  ) {
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onValueChange?.(event.target.value, event);
    }, [onChange, onValueChange]);

    return (
      <Field id={id} label={label} className={className} color={color}>
        <Input id={id} {...props} onChange={handleChange} className="px-3 py-2 outline-none w-full" />
      </Field>
    );
  },
);
