import { memo } from "react";
import type { TableColumn } from "../types.ts";
import { TableContext } from "./TableContext.tsx";

export const TableFoot = memo(function TableFoot() {
  const { columns, columnData } = TableContext.use((s) => ({
    columns: s.columns.all(),
    columnData: s.columns.all().map((column) => s.rows.all().map((row) => row.values[column.id])),
  }));

  return (
    <tfoot className="z-10 sticky top-0 left-0 bg-primary-6 text-left">
      <tr className="flex w-full divide-x divide-primary-6 border-b border-primary-5 shadow shadow-primary-5">
        {columns.map((column) => <TableFootRowCell key={column.id} column={column} data={columnData[column.id]} />)}
      </tr>
    </tfoot>
  );
});

export const TableFootRowCell = memo<{ column: TableColumn<any, any>; data: any[] }>(
  function TableFootRowCell({ column, data }) {
    return (
      <td className="flex items-center grow w-full flex-1 overflow-auto">
        <column.FootRowCell column={column} data={data} />
      </td>
    );
  },
);
