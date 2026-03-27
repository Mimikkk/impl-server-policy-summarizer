import { memo, useCallback } from "react";
import type { Table as TableType } from "../types.ts";
import { TableBody } from "./TableBody.tsx";
import { TableContext } from "./TableContext.tsx";
import { TableHead } from "./TableHead.tsx";
import { TableSearchField } from "./TableSearchField.tsx";

export const Table = memo(function Table({ table }: { table: TableType<any, any> }) {
  return (
    <TableContext.Provider table={table}>
      <Content />
    </TableContext.Provider>
  );
});

const Content = memo(function Content() {
  const [scrollRef, refs] = TableContext.use((s) => [s.features.virtual.ref, s.refs]);

  const setupTableRef = useCallback((ref: HTMLTableElement | null) => {
    refs.table = ref;
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <TableSearchField />
      <div ref={scrollRef} className="relative block h-[500px] overflow-auto rounded-sm border border-primary-6">
        <table ref={setupTableRef} className="w-full border-separate" cellSpacing="0" cellPadding="0">
          <TableHead />
          <TableBody />
        </table>
      </div>
    </div>
  );
});
