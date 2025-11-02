import { useVirtualizer } from "@tanstack/react-virtual";
import { defineContext } from "@utilities/defineContext.ts";
import { useCallback, useMemo, useRef } from "react";
import type { Table, TableColumn } from "../types.ts";

export const TableContext = defineContext(({ table }: { table: Table<any, TableColumn<any, any>[]> }) => {
  const { defaultState, store: { use, set }, rows } = table;
  use();

  const reset = useCallback(() => {
    set(structuredClone(defaultState));
  }, [defaultState]);

  const virtualizerScrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.all().length,
    getScrollElement: () => virtualizerScrollRef.current,
    estimateSize: () => 30,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const visibleRows = useMemo(
    () => virtualItems.map(({ size, start, index }) => ({ size, start, row: rows.filtered()[index] })),
    [rows.filtered(), virtualItems],
  );

  return {
    reset,
    features: {
      search: table.features.search,
      columnFilters: table.features.columnFilters,
      virtual: {
        ref: virtualizerScrollRef,
        totalRowHeight: () => virtualizer.getTotalSize(),
      },
    },
    rows: {
      all: rows.all(),
      visible: visibleRows,
      filtered: rows.filtered(),
    },
    columns: {
      visible: table.store.get().columns,
    },
    props: table.props,
  };
});
