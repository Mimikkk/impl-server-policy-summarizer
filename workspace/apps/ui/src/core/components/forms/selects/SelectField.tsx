import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import { Popover } from "radix-ui";
import { type ComponentProps, memo, type ReactNode, useMemo, useState } from "react";
import { Field } from "../Field.tsx";
import type { Option } from "./Option.tsx";

import { uiElementClass } from "@utilities/uiElementClass.tsx";
import { Command as CMDK } from "cmdk";
import { useLayoutEffect } from "react";
import { Button } from "../../actions/Button.tsx";
import { Icon } from "../../badges/Icon.tsx";
import { Text } from "../../typography/Text.tsx";
import { For } from "../../utility/For.tsx";

export interface SelectFieldProps<T extends string> {
  color?: ColorName;
  label?: string;
  value: T;
  disabled?: boolean;
  onValueChange?: (value: T | null) => void;
  options: Option<T>[];
  className?: string;
  id?: string;
}

export const SelectField = memo(
  function SelectField<T extends string>(
    { color = "primary", id, label, onValueChange, className, options, value, disabled }: SelectFieldProps<T>,
  ) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<T | null>(value ?? null);
    const [triggerRef, setTriggerRef] = useState<HTMLButtonElement | null>(null);
    const [triggerSize, setTriggerSize] = useState(0);

    useLayoutEffect(() => {
      if (!triggerRef) return;

      const updateSize = () => {
        setTriggerSize(triggerRef.getBoundingClientRect().width + 1);
      };

      updateSize();
      const observer = new ResizeObserver(updateSize);
      observer.observe(triggerRef);

      return () => observer.disconnect();
    }, [triggerRef]);

    const selectedLabel = useMemo(
      () => options.find((option) => option.value === selected)?.label ?? "Select option...",
      [options, selected],
    );

    return (
      <Field color={color} id={id} label={label} className={className} disabled={disabled}>
        <Popover.Root open={open && !disabled} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              ref={setTriggerRef}
              variant="text"
              role="combobox"
              color={color}
              aria-expanded={open}
              className="w-full !justify-between gap-2 px-3 py-2 h-9"
              disabled={disabled}
            >
              <Text>{selectedLabel}</Text>
              <Button color="secondary" variant="text" as="span" disabled={disabled}>
                <Icon name="ChevronDown" />
              </Button>
            </Button>
          </Popover.Trigger>
          <Popover.Content
            style={{ width: triggerSize }}
            className={cx(
              uiElementClass({ color, variant: "solid" }),
              "z-10 px-4 py-2 overflow-auto shadow",
            )}
            sideOffset={10}
          >
            <SelectDropdown className="flex flex-col gap-2">
              <SelectSearch color={color} placeholder="Search options..." />
              <SelectSeparator color={color} />
              <SelectList>
                <SelectEmpty>No options found.</SelectEmpty>
                <For each={options}>
                  {({ value, label }) => (
                    <SelectOption
                      key={value}
                      value={value}
                      onSelect={(value) => {
                        const next = value === selected ? null : (value as T);

                        setSelected(next);
                        onValueChange?.(next);

                        setOpen(false);
                      }}
                      className={selected === value ? `bg-${color}-5` : undefined}
                    >
                      <Icon
                        name="Check"
                        size="sm"
                        className={selected !== value ? "opacity-0" : undefined}
                      />
                      {label}
                    </SelectOption>
                  )}
                </For>
              </SelectList>
            </SelectDropdown>
          </Popover.Content>
        </Popover.Root>
      </Field>
    );
  },
) as <T extends string>(props: SelectFieldProps<T>) => ReactNode;

function SelectDropdown({ className, ...props }: ComponentProps<typeof CMDK>) {
  return (
    <CMDK data-slot="command" className={cx("flex h-full w-full flex-col overflow-hidden", className)} {...props} />
  );
}

function SelectSearch({ color, className, ...props }: ComponentProps<typeof CMDK.Input> & { color: ColorName }) {
  return (
    <div data-slot="command-input-wrapper" className="flex items-center gap-2">
      <CMDK.Input
        data-slot="command-input"
        className={cx(
          uiElementClass({ color, variant: "solid" }),
          className,
          "w-full outline-none px-2 py-1",
        )}
        {...props}
      />
    </div>
  );
}

function SelectList(props: ComponentProps<typeof CMDK.List>) {
  return <CMDK.List data-slot="command-list" {...props} />;
}

function SelectEmpty(props: ComponentProps<typeof CMDK.Empty>) {
  return <CMDK.Empty data-slot="command-empty" {...props} />;
}

function SelectSeparator(
  { color, className, ...props }: ComponentProps<typeof CMDK.Separator> & { color: ColorName },
) {
  return (
    <CMDK.Separator
      data-slot="command-separator"
      className={cx(
        uiElementClass({ color, variant: "solid", interactive: false }),
        "border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function SelectOption({ className, ...props }: ComponentProps<typeof CMDK.Item>) {
  return (
    <CMDK.Item
      data-slot="command-item"
      className={cx(
        uiElementClass({ color: "secondary", variant: "text" }),
        "flex items-center gap-2 cursor-pointer py-1 px-1",
        className,
      )}
      {...props}
    />
  );
}
