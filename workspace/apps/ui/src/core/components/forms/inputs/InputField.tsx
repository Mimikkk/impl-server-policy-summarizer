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
}
export const InputField = memo(
  function InputField(
    { id, label, onValueChange, className, color, disabled, compact, ...props }: InputFieldProps,
  ) {
    const [value, setValue] = useDebounceState(props.value ?? "", onValueChange ?? noop);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      setValue(event.target.value);
    }, [setValue]);

    return (
      <Field id={id} label={label} className={className} color={color} disabled={disabled}>
        <input
          id={id}
          {...props}
          value={value}
          onChange={handleChange}
          className={clsx("outline-none w-full px-3", compact ? "h-7" : "py-2")}
          disabled={disabled}
        />
      </Field>
    );
  },
);
