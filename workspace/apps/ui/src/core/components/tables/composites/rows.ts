import { memo } from "@utilities/memo.ts";
import type { ColumnId, Table, TableColumn } from "../types.ts";

export const createRows = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  api: Table<TData, TColumns>,
): Table<TData, TColumns>["rows"] => ({
  all: memo(
    () => [api.store.get().data],
    (data) => data.map((data, index) => ({ values: data, id: `${index}`, index })),
  ),
  filtered: memo(
    () => [
      api.rows.all(),
      api.columns.all(),
      api.features.searchFilter.get(),
      api.features.columnFilters.get(),
      api.features.externFilters.get(),
    ],
    (rows, columns, searchFilter, columnFilters, externFilters) => {
      const result = [];

      filter_it: for (let i = 0; i < rows.length; ++i) {
        const row = rows[i];
        const values = row.values;

        for (const columnId in columnFilters) {
          const query = columnFilters[columnId]?.toLowerCase().trim() ?? "";
          const column = columns.find(({ id }) => id === columnId);
          if (!column) continue;
          if (column.columnFilter(values[columnId]!, query)) continue;

          continue filter_it;
        }

        for (const filter of externFilters) {
          if (!filter(row, searchFilter)) continue filter_it;
        }

        if (searchFilter) {
          const query = searchFilter.toLowerCase().trim();
          if (!columns.some(({ searchFilter: filter, id }) => filter(values[id]!, query))) continue filter_it;
        }

        result.push(row);
      }

      return result;
    },
  ),
});
