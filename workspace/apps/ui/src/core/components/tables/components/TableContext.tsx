import { useVirtualizer } from "@tanstack/react-virtual";
import { defineContext } from "@utilities/defineContext.ts";
import { useRef } from "react";
import type { Table, TableColumn, TableRow } from "../types.ts";

const useTableVirtualizer = <TData,>(rows: TableRow<TData>[]) => {
  const ref = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => ref.current,
    estimateSize: () => 30,
    overscan: 30,
    getItemKey: (index) => rows[index].id,
  });

  return {
    ref,
    items: () => virtualizer.getVirtualItems(),
    totalRowHeight: () => virtualizer.getTotalSize(),
  };
};

export const TableContext = defineContext(({ table }: { table: Table<any, TableColumn<any, any>[]> }) => {
  const { store: { use }, rows } = table;
  use();

  return {
    features: {
      searchFilter: table.features.searchFilter,
      columnFilters: table.features.columnFilters,
      virtual: useTableVirtualizer(rows.filtered()),
    },
    rows,
    refs: table.refs,
    columns: table.columns,
    props: table.props,
  };
});
