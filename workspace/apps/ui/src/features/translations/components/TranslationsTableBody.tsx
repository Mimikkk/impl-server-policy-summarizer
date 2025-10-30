import clsx from "clsx";
import { useTranslationsView } from "../TranslationsView.context.tsx";
import { BodyCell } from "./BodyCell.tsx";

export const TranslationsTableBody = () => {
  const { tableData: { table, filteredRows, virtualizer } } = useTranslationsView();

  return (
    <tbody className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const row = filteredRows[virtualRow.index];
        return (
          <tr
            key={row.id}
            className={clsx(
              `
                      flex w-full items-stretch absolute top-0 left-0
                      divide-x divide-primary-6
                      min-h-7.5 h-full   
                      hover:bg-primary-4 bg-primary-5 even:bg-primary-6
                      hover:[&_[data-source]]:bg-success-4  [&_[data-source]]:bg-success-5 even:[&_[data-source]]:bg-success-6
                      hover:[&_[data-target]]:bg-info-4 [&_[data-target]]:bg-info-5 even:[&_[data-target]]:bg-info-6
                      `,
            )}
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {table.columns.map((column) => <BodyCell key={column.id} row={row} column={column} />)}
          </tr>
        );
      })}
    </tbody>
  );
};
