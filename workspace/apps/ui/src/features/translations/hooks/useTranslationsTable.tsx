import { useVirtualizer } from "@tanstack/react-virtual";
import { type RefObject, useMemo } from "react";
import { KeyBodyRowCell } from "../components/Table/boyslove/KeyBodyRowCell.tsx";
import { KeyColumnCell } from "../components/Table/boyslove/KeyColumnCell.tsx";
import { LanguageBodyRowCell } from "../components/Table/boyslove/LanguageBodyRowCell.tsx";
import { LanguageColumnCell } from "../components/Table/boyslove/LanguageColumnCell.tsx";
import { defineTable } from "../defineTable.tsx";

interface useTranslationsTableProps {
  storage: { contents: Record<string, string>[] } | undefined;
  showMissingTranslations: boolean;
  query: string;
  keyQuery: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export const useTranslationsTable = ({
  storage,
  showMissingTranslations,
  query,
  keyQuery,
  scrollContainerRef,
}: useTranslationsTableProps) => {
  const table = useMemo(() =>
    defineTable({
      data: storage?.contents ?? [],
      columns: Object.keys(storage?.contents?.[0] ?? {}).map((key) => {
        return ({
          id: key,
          label: key,
          HeaderCell: key === "key" ? KeyColumnCell : LanguageColumnCell,
          RowCell: key === "key" ? KeyBodyRowCell : LanguageBodyRowCell,
        });
      }),
      classNames: {
        tbody: `
        hover:**:data-source:bg-success-4  **:data-source:bg-success-5 even:**:data-source:bg-success-6
        hover:**:data-target:bg-info-4 **:data-target:bg-info-5 even:**:data-target:bg-info-6
      `,
      },
    }), [storage?.contents]);

  const visibleRows = useMemo(() => {
    return showMissingTranslations
      ? table.rows.filter((row) => table.columns.some((column) => !row.original[column.id]))
      : table.rows;
  }, [table.rows, table.columns, showMissingTranslations]);

  const filteredRows = useMemo(
    () =>
      visibleRows.filter((row) =>
        !query || table.columns.some((column) => row.original[column.id]?.toLowerCase().includes(query.toLowerCase()))
      ).filter(
        (row) => !keyQuery || row.original.key?.toLowerCase().includes(keyQuery.toLowerCase()),
      ),
    [visibleRows, query, keyQuery, table.columns],
  );

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 30,
    overscan: 5,
  });

  return {
    table,
    filteredRows,
    virtualizer,
  };
};
