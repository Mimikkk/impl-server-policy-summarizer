import { For } from "@components/utility/For.tsx";
import { type ChangeEvent, memo, ReactNode, type SelectHTMLAttributes, useCallback } from "react";
import { Field } from "../Field.tsx";
import type { Option } from "./Option.tsx";

export interface SelectFieldProps<T extends string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value"> {
  label?: string;
  value: T;
  onValueChange?: (value: T, event: ChangeEvent<HTMLSelectElement>) => void;
  options: Option<T>[];
}
export const SelectField = memo(
  function SelectField<T extends string>(
    { id, label, onChange, onValueChange, className, options, ...props }: SelectFieldProps<T>,
  ) {
    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event);
      onValueChange?.(event.target.value as T, event);
    }, [onChange, onValueChange]);

    return (
      <Field id={id} label={label} className={className}>
        <select
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
        >
          <For each={options}>
            {(option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )}
          </For>
        </select>
      </Field>
    );
  },
) as <T extends string>(props: SelectFieldProps<T>) => ReactNode;
