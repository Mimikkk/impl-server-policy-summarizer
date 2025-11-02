import { memo } from "react";
import { TableBody } from "../components/TableBody.tsx";
import { TableContext } from "../components/TableContext.tsx";
import { TableHead } from "../components/TableHead.tsx";
import { TableSearchField } from "../components/TableSearchField.tsx";
import type { Table as TableType } from "../types.ts";

export const Table = memo(function Table({ table }: { table: TableType<any, any> }) {
  return (
    <TableContext.Provider table={table}>
      <Content />
    </TableContext.Provider>
  );
});

const Content = memo(function Content() {
  const scrollRef = TableContext.use((s) => s.features.virtual.ref);

  return (
    <div className="flex flex-col gap-2">
      <TableSearchField />
      <div ref={scrollRef} className="overflow-auto block h-[500px] relative border border-primary-6 rounded-sm">
        <table className="border-separate w-full" cellSpacing="0" cellPadding="0">
          <TableHead />
          <TableBody />
        </table>
      </div>
    </div>
  );
});
