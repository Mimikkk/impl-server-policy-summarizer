import clsx from "clsx";
import { memo, useEffect } from "react";
import type { TableColumn, TableRow } from "../types.ts";
import { TableContext } from "./TableContext.tsx";

export const TableBody = memo(function TableBody() {
  const { virtualItems, rows, totalRowHeight, columns, className } = TableContext.use((s) => ({
    virtualItems: s.features.virtual.items(),
    rows: s.rows.filtered(),
    totalRowHeight: s.features.virtual.totalRowHeight(),
    columns: s.columns.all(),
    className: s.props.bodyRow?.className,
  }));

  useEffect(() => {
    const rowElements = document.querySelectorAll<HTMLTableRowElement>("tbody tr");

    for (let i = 0; i < virtualItems.length; ++i) {
      const { dataset, style } = rowElements[i];
      const { size, start, index } = virtualItems[i];

      style.height = `${size}px`;
      style.transform = `translateY(${start}px)`;
      const isEven = index % 2 === 0;

      if (isEven) {
        dataset.even = "";
      } else if (dataset.even) {
        delete dataset.even;
      }
    }
  }, [virtualItems]);

  useEffect(() => {
    const bodyElement = document.querySelector("tbody");

    if (!bodyElement) return;
    bodyElement.style.height = `${totalRowHeight}px`;
  }, [totalRowHeight]);

  return (
    <tbody className="relative">
      {virtualItems.map(({ index }) => (
        <TableBodyRow key={index} columns={columns} row={rows[index]} className={className} />
      ))}
    </tbody>
  );
});

export const TableBodyRow = memo<{ columns: TableColumn<any, any>[]; row: TableRow<any>; className?: string }>(
  function TableBodyRow({ columns, row, className }) {
    return (
      <tr
        className={clsx(
          `absolute top-0 left-0 flex w-full divide-x divide-primary-6 bg-primary-5 hover:bg-primary-4 data-even:bg-primary-6`,
          className,
        )}
      >
        {columns.map((column) => (
          <TableBodyRowCell key={column.id} row={row} column={column} />
        ))}
      </tr>
    );
  },
);

export const TableBodyRowCell = memo<{ row: TableRow<any>; column: TableColumn<any, any> }>(function TableBodyRowCell({
  row,
  column,
}) {
  return (
    <td className="flex w-full flex-1 grow items-center overflow-auto">
      <column.BodyRowCell column={column} row={row} />
    </td>
  );
});
