import type { TableOptions } from "../defineTable.ts";
import { createColumnFiltersFeature } from "../features/columnFiltersFeature.ts";
import { createSearchFeature } from "../features/searchFilterFeature.ts";
import type { ColumnId, Table, TableColumn } from "../types.ts";

export const createFeatures = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  table: Table<TData, TColumns>,
  options: TableOptions<TData, TColumns>["options"],
): Table<TData, TColumns>["features"] => ({
  searchFilter: createSearchFeature(table, options.searchFilter),
  columnFilters: createColumnFiltersFeature(table, options.columnFilters),
});
