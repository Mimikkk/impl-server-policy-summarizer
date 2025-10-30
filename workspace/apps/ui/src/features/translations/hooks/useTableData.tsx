import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, type RefObject } from "react";
import { createTable } from "../createTable.tsx";

interface UseTableDataProps {
  storage: { contents: Record<string, string>[] } | undefined;
  showMissingTranslations: boolean;
  query: string;
  keyQuery: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export const useTableData = ({
  storage,
  showMissingTranslations,
  query,
  keyQuery,
  scrollContainerRef,
}: UseTableDataProps) => {
  const table = useMemo(() =>
    createTable({
      data: storage?.contents ?? [],
      columns: Object.keys(storage?.contents?.[0] ?? {}).map((key) => ({ id: key, label: key })),
    }), [storage?.contents]);

  const visibleRows = useMemo(() => {
    return showMissingTranslations
      ? table.rows.filter((row) => table.columns.some((column) => !row.original[column.id]))
      : table.rows;
  }, [table.rows, table.columns, showMissingTranslations]);

  const filteredRows = useMemo(
    () =>
      visibleRows.filter((row) =>
        !query || table.columns.some((column) => row.original[column.id].toLowerCase().includes(query.toLowerCase()))
      ).filter(
        (row) => !keyQuery || row.original.key.toLowerCase().includes(keyQuery.toLowerCase()),
      ),
    [visibleRows, query, keyQuery, table.columns],
  );

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 30,
    overscan: 5,
  });

  return { table, filteredRows, virtualizer };
};

