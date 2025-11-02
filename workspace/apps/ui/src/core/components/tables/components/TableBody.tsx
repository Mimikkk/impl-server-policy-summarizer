import clsx from "clsx";
import { memo } from "react";
import type { TableColumn, TableRow } from "../types.ts";
import { TableContext } from "./TableContext.tsx";

export const TableBody = memo(function TableBody() {
  const { rows, totalRowHeight, columns, className } = TableContext.use((s) => ({
    rows: s.rows.visible,
    totalRowHeight: s.features.virtual.totalRowHeight(),
    columns: s.columns.visible,
    className: s.props.tbody?.className,
  }));

  return (
    <tbody className="relative" style={{ height: `${totalRowHeight}px` }}>
      {rows.map(({ size, start, row }) => (
        <tr
          key={row.id}
          className={clsx(
            `
              flex w-full items-stretch absolute top-0 left-0
              divide-x divide-primary-6
              min-h-7.5 h-full   
              hover:bg-primary-4 bg-primary-5 even:bg-primary-6
            `,
            className,
          )}
          style={{ height: `${size}px`, transform: `translateY(${start}px)` }}
        >
          {columns.map((column) => <TableBodyRowCell key={column.id} row={row} column={column} />)}
        </tr>
      ))}
    </tbody>
  );
});

export const TableBodyRowCell = memo<{ row: TableRow<any>; column: TableColumn<any, any> }>(
  function TableBodyRowCell({ row, column }) {
    return (
      <td className="flex items-center grow w-full flex-1 overflow-auto">
        <column.RowCell row={row} column={column} />
      </td>
    );
  },
);
