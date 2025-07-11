import { ColorName } from "@features/ux/theme/ColorPalette.ts";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { uiElementClass } from "@utilities/uiElementClass.tsx";
import cx from "clsx";
import { ChevronDownIcon } from "lucide-react";
import {
  type ChangeEvent,
  memo,
  type ReactNode,
  type SelectHTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import { For } from "../../utility/For.tsx";
import { Show } from "../../utility/Show.tsx";
import { Field } from "../Field.tsx";
import type { Option } from "./Option.tsx";

export interface SelectFieldProps<T extends string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value"> {
  color?: ColorName;
  label?: string;
  value: T;
  onValueChange?: (value: T, event: ChangeEvent<HTMLSelectElement>) => void;
  options: Option<T>[];
}
export const SelectField = memo(
  function SelectField<T extends string>(
    { color = "primary", id, label, onChange, onValueChange, className, options, ...props }: SelectFieldProps<T>,
  ) {
    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event);
      onValueChange?.(event.target.value as T, event);
    }, [onChange, onValueChange]);

    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    return (
      <Field color={color} id={id} label={label} className={cx("px-3 py-2", className)}>
        <Combobox
          as="div"
          className="relative flex gap-1"
          onFocus={() => {
            console.log("focus");
            return setOpen(true);
          }}
          onBlur={() => {
            console.log("blur");
            return setOpen(false);
          }}
        >
          <ComboboxInput
            displayValue={(value) => {
              const option = options.find((option) => option.value === value);
              return option?.label ?? "";
            }}
            onChange={(event) => {
              console.log("changed", event.target.value);
            }}
            onClick={() => {
              console.log("clicked", buttonRef);
              buttonRef.current?.click();
            }}
            onFocus={() => {
              buttonRef.current?.click();
            }}
            className="outline-none overflow-hidden text-ellipsis"
          />
          <ComboboxButton
            className={cx("cursor-pointer", uiElementClass({ color: "secondary", variant: "text" }))}
            ref={buttonRef}
          >
            <ChevronDownIcon className="w-4 h-4" />
          </ComboboxButton>

          <Show when={open}>
            <ComboboxOptions
              anchor={{
                gap: 8,
                to: "bottom start",
              }}
              as="div"
              className={cx("-ml-2", uiElementClass({ color, variant: "solid" }))}
            >
              <For each={options}>
                {(option) => (
                  <ComboboxOption
                    key={option.value}
                    value={option.value}
                    className={cx(
                      "px-2 py-1 cursor-pointer",
                      uiElementClass({ color: "secondary", variant: "text" }),
                    )}
                  >
                    {option.label}
                  </ComboboxOption>
                )}
              </For>
            </ComboboxOptions>
          </Show>
        </Combobox>
      </Field>
    );
  },
) as <T extends string>(props: SelectFieldProps<T>) => ReactNode;
