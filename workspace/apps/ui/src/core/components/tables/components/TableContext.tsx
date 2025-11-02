import { useVirtualizer } from "@tanstack/react-virtual";
import { defineContext } from "@utilities/defineContext.ts";
import { useRef } from "react";
import type { Table, TableColumn } from "../types.ts";

export const TableContext = defineContext(({ table }: { table: Table<any, TableColumn<any, any>[]> }) => {
  const { store: { use }, rows } = table;
  use();

  const filtered = rows.filtered();
  const virtualizerScrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => virtualizerScrollRef.current,
    estimateSize: () => 30,
    overscan: 30,
    getItemKey: (index) => filtered[index].id,
  });

  return {
    features: {
      searchFilter: table.features.searchFilter,
      columnFilters: table.features.columnFilters,
      virtual: {
        ref: virtualizerScrollRef,
        items: () => virtualizer.getVirtualItems(),
        totalRowHeight: () => virtualizer.getTotalSize(),
      },
    },
    rows: {
      all: rows.all,
      filtered: rows.filtered,
    },
    columns: table.columns,
    props: table.props,
  };
});
