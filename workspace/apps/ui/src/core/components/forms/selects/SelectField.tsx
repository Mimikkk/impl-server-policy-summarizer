import type { ColorName } from "@features/ux/theme/ColorPalette.ts";
import cx from "clsx";
import { Popover, Tooltip } from "radix-ui";
import { type ComponentProps, memo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Field } from "../Field.tsx";
import type { Option } from "./Option.tsx";

import { useDebounceState } from "@hooks/useDebounceState.tsx";
import { useResizeObserver } from "@hooks/useResizeObserver.tsx";
import { uiElementClass } from "@utilities/uiElementClass.ts";
import { Command as CMDK } from "cmdk";
import { Button } from "../../actions/Button.tsx";
import { IconButton } from "../../actions/IconButton.tsx";
import { Icon } from "../../badges/Icon.tsx";
import { Card } from "../../containers/card/Card.tsx";
import { List, type ListItem } from "../../containers/List.tsx";
import { Text } from "../../typography/Text.tsx";

export interface SelectFieldProps<T extends string> {
  color?: ColorName;
  label?: string;
  value: T | null;
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

    useEffect(() => {
      setSelected(value ?? null);
    }, [value]);

    const [query, setQuery] = useState("");
    const filteredOptions = useMemo(() => {
      if (!query) return options;

      return options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
    }, [options, query]);

    const selectedLabel = useMemo(
      () => options.find((o) => o.value === selected)?.label ?? "Select option...",
      [options, selected],
    );

    const handleSelect = useCallback((value: string) => {
      const next = value === selected ? null : (value as T);

      setSelected(next);
      onValueChange?.(next);

      setOpen(false);
    }, [selected, onValueChange]);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleResize = useCallback(() => {
      contentRef.current!.style.width = `${triggerRef.current!.getBoundingClientRect().width}px`;
    }, [triggerRef, contentRef]);

    const handleContentRef = useCallback((ref: HTMLDivElement) => {
      contentRef.current = ref;
      observer.current?.observe(ref);
      handleResize();
      return () => observer.current?.unobserve(ref);
    }, [contentRef]);

    const observer = useResizeObserver({ onChange: handleResize });

    return (
      <Field color={color} id={id} label={label} className={className} disabled={disabled}>
        <Popover.Root open={open && !disabled} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              ref={triggerRef}
              variant="text"
              role="combobox"
              color={color}
              aria-expanded={open}
              className="!justify-between gap-2 px-3 py-2 h-8 w-full"
              disabled={disabled}
            >
              <Text ellipsis>{selectedLabel}</Text>
              <IconButton
                className="shrink-0"
                color="secondary"
                variant="text"
                as="span"
                disabled={disabled}
                name="ChevronDown"
                compact
              />
            </Button>
          </Popover.Trigger>
          <Popover.Content
            ref={handleContentRef}
            className={cx(
              uiElementClass({ color, variant: "solid" }),
              "z-10 px-4 py-2 overflow-auto shadow",
            )}
            sideOffset={10}
          >
            <SelectDropdown className="flex flex-col gap-2">
              <SelectSearch
                value={query}
                onValueChange={setQuery}
                color={color}
                placeholder="Search options..."
              />
              <SelectSeparator color={color} />
              <Tooltip.TooltipProvider delayDuration={0}>
                <SelectList>
                  <SelectEmpty>No options found.</SelectEmpty>
                  <List items={filteredOptions} estimateSize={28} maxHeight={400}>
                    {useCallback(({ item: { label, value }, size, key, start }: ListItem<Option<T>>) => {
                      return (
                        <Tooltip.Root key={key}>
                          <Tooltip.Trigger asChild>
                            <SelectOption
                              value={value}
                              onSelect={handleSelect}
                              className={cx(
                                "absolute top-0 left-0 w-full",
                                selected === value ? `bg-${color}-5` : undefined,
                              )}
                              style={{ height: `${size}px`, transform: `translateY(${start}px)` }}
                            >
                              {selected === value && <Icon name="Check" size="sm" />}
                              <Text ellipsis>
                                {label}
                              </Text>
                            </SelectOption>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            side="right"
                            align="center"
                            className="max-w-72"
                            style={{ transform: `translate(0px, ${start + size / 2}px)` }}
                          >
                            <Card>
                              <Text>{label}</Text>
                            </Card>
                          </Tooltip.Content>
                        </Tooltip.Root>
                      );
                    }, [color, handleSelect, selected])}
                  </List>
                </SelectList>
              </Tooltip.TooltipProvider>
            </SelectDropdown>
          </Popover.Content>
        </Popover.Root>
      </Field>
    );
  },
) as <T extends string>(props: SelectFieldProps<T>) => ReactNode;

function SelectDropdown({ className, ...props }: ComponentProps<typeof CMDK>) {
  return (
    <CMDK
      shouldFilter={false}
      data-slot="command"
      className={cx("flex h-full w-full flex-col overflow-hidden", className)}
      {...props}
    />
  );
}

function SelectSearch({ color, className, ...props }: ComponentProps<typeof CMDK.Input> & { color: ColorName }) {
  const [value, setValue] = useDebounceState(props.value ?? "", props.onValueChange!);

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
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}

const SelectList = memo(function SelectList(props: ComponentProps<typeof CMDK.List>) {
  return <CMDK.List data-slot="command-list" {...props} />;
});

function SelectEmpty(props: ComponentProps<typeof CMDK.Empty>) {
  return <CMDK.Empty data-slot="command-empty" {...props} />;
}

function SelectSeparator(
  { color, className, ...props }: ComponentProps<typeof CMDK.Separator> & { color: ColorName },
) {
  return (
    <div
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
        "flex items-center gap-2 cursor-pointer py-1 px-1 text-ellipsis overflow-hidden whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}
