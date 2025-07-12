import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { type ReactNode, useCallback, useState } from "react";
import { For } from "../utility/For.tsx";

export interface ListItem<T> extends VirtualItem {
  item: T;
}

export interface ListProps<T> {
  children: (item: ListItem<T>, index: number) => ReactNode;
  className?: string;
  maxHeight?: number;
  estimateSize: number;
  items: T[];
  overscan?: number;
  count?: number;
}

export const List = <T,>(
  { children, className, maxHeight = 400, items, estimateSize, overscan = 4, count }: ListProps<T>,
) => {
  const [listRef, setListRef] = useState<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: count ?? items.length,
    getScrollElement: () => listRef,
    estimateSize: () => estimateSize,
    overscan,
  });

  const rows = virtualizer.getVirtualItems();
  const size = virtualizer.getTotalSize();

  return (
    <div ref={setListRef} style={{ height: maxHeight, overflow: "auto" }} className={className}>
      <For
        each={rows}
        as="div"
        className="relative w-full"
        style={{ height: `${size}px` }}
      >
        {useCallback(({ index, start, size, end, key, lane }: VirtualItem, i: number) => (
          children({ item: items[index], end, key, lane, size, start, index }, i)
        ), [items, children])}
      </For>
    </div>
  );
};
