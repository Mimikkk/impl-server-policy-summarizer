import { Icon } from "@components/badges/Icon.tsx";
import { Card } from "@components/containers/card/Card.tsx";
import { InputField } from "@components/forms/inputs/InputField.tsx";
import { Text } from "@components/typography/Text.tsx";
import { For } from "@components/utility/For.tsx";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { icons } from "lucide-react";
import { startTransition, useCallback, useMemo, useRef, useState } from "react";
import { useDebounceState } from "../../../core/hooks/useDebounceState.tsx";
import { useResponsiveValue } from "../../../core/hooks/useResponsiveValue.tsx";

const preparedIcons = Object.entries(icons);
export const IconPalleteView = () => {
  const [query, setQuery] = useState("");

  const [value, setValue] = useDebounceState(
    query,
    useCallback((value) => startTransition(() => setQuery(value)), [setQuery]),
  );

  const filteredIcons = useMemo(
    () => {
      const filter = query.replaceAll(" ", "").toLowerCase();

      return preparedIcons.filter(([name]) => name.toLowerCase().includes(filter));
    },
    [query],
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useResponsiveValue({ xl: 12, lg: 8, md: 6, sm: 4, xs: 3 });
  const rowCount = Math.ceil(filteredIcons.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 4,
  });

  const size = rowVirtualizer.getTotalSize();
  const rows = rowVirtualizer.getVirtualItems();

  const rowsStyle = useMemo(() => ({ height: `${size}px` }), [size]);

  return (
    <div className="flex flex-col gap-2">
      <InputField
        placeholder="Search..."
        value={value}
        onValueChange={setValue}
      />
      <Card ref={parentRef} className="h-[480px] overflow-auto">
        <For
          each={rows}
          as="div"
          className="relative w-full"
          style={rowsStyle}
          fallback={
            <Text className="flex items-center justify-center gap-1">
              <Icon name="Search" />
              <Text>No icons</Text>
            </Text>
          }
        >
          {useCallback(({ key, index, start }: VirtualItem, i: number) => (
            <For
              key={key}
              each={filteredIcons.slice(index * columns, (index + 1) * columns)}
              as="div"
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2 absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${start + (i * 10)}px)` }}
            >
              {([name, Icon]) => (
                <Card
                  key={name}
                  onClick={() => navigator.clipboard.writeText(name)}
                  className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:!text-primary-11"
                >
                  <Icon />
                  <Text className="pb-1 text-xs overflow-auto max-w-full select-all">{name}</Text>
                </Card>
              )}
            </For>
          ), [rows, columns])}
        </For>
      </Card>
    </div>
  );
};
