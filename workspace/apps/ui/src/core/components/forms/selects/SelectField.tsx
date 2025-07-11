import { For } from "@components/utility/For.tsx";
import { Select } from "@headlessui/react";
import { type ChangeEvent, memo, type ReactNode, type SelectHTMLAttributes, useCallback } from "react";
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
        <Select id={id} {...props} onChange={handleChange} className="px-3 py-2 outline-none">
          <For each={options}>
            {(option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )}
          </For>
        </Select>
      </Field>
    );
  },
) as <T extends string>(props: SelectFieldProps<T>) => ReactNode;
