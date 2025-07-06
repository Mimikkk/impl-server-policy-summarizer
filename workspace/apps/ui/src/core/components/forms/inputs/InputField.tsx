import { type ChangeEvent, type InputHTMLAttributes, memo, useCallback } from "react";
import { Field } from "../Field.tsx";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}
export const InputField = memo(
  function InputField(
    { id, label, onChange, onValueChange, className, ...props }: InputFieldProps,
  ) {
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onValueChange?.(event.target.value, event);
    }, [onChange, onValueChange]);

    return (
      <Field id={id} label={label} className={className}>
        <input
          id={id}
          {...props}
          onChange={handleChange}
          className="
            px-3 py-2 border 
            bg-primary-2
            border-primary-6 focus-within:border-primary-7 active:border-primary-7 hover:border-primary-8
            rounded-xs
            disabled:opacity-50
            "
        />
      </Field>
    );
  },
);
