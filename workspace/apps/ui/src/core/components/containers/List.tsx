import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import clsx from "clsx";
import { type ReactNode, useCallback, useLayoutEffect, useMemo, useRef } from "react";
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
  const listRef = useRef<HTMLDivElement | null>(null);
  const contentsRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: count ?? items.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const indexes = virtualizer.getVirtualIndexes();
  const rows = useMemo(() => virtualizer.getVirtualItems(), [indexes.join()]);

  const size = virtualizer.getTotalSize();
  useLayoutEffect(() => {
    contentsRef.current!.style.height = `${size}px`;
  }, [size]);

  useLayoutEffect(() => {
    listRef.current!.style.height = `${maxHeight}px`;
  }, [maxHeight]);

  return (
    <div ref={listRef} className={clsx("overflow-auto", className)}>
      <For ref={contentsRef} each={rows} as="div" className="relative">
        {useCallback(({ index, start, size, end, key, lane }: VirtualItem, i: number) => (
          children({ item: items[index], end, key, lane, size, start, index }, i)
        ), [items, children])}
      </For>
    </div>
  );
};
