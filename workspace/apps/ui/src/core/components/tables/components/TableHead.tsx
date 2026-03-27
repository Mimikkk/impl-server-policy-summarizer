import { memo, type PropsWithChildren } from "react";
import { TableContext } from "./TableContext.tsx";

export const TableHead = memo(function TableHead() {
  const columns = TableContext.use((s) => s.columns.all());

  return (
    <thead className="sticky top-0 left-0 z-10 bg-primary-6 text-left">
      <tr className="flex w-full divide-x divide-primary-6 border-b border-primary-5 shadow shadow-primary-5">
        {columns.map((column) => (
          <TableHeadRowCell key={column.id}>
            <column.HeadRowCell column={column} />
          </TableHeadRowCell>
        ))}
      </tr>
    </thead>
  );
});

export const TableHeadRowCell = memo<PropsWithChildren>(function TableHeadRowCell({ children }) {
  return <th className="h-auto flex-1">{children}</th>;
});
