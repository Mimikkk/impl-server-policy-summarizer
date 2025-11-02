import { memo } from "react";
import { TableContext } from "../components/TableContext.tsx";
import { TableSearchField } from "../components/TableSearchField.tsx";
import type { Table as TableType } from "../types.ts";
import { TableBody } from "./TableBody.tsx";
import { TableFoot } from "./TableFoot.tsx";
import { TableHead } from "./TableHead.tsx";

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
          <TableFoot />
          <TableHead />
          <TableBody />
        </table>
      </div>
    </div>
  );
});
