import type { TableOptions } from "../defineTable.ts";
import { createColumnFiltersFeature } from "../features/columnFiltersFeature.ts";
import { createExternFiltersFeature } from "../features/externFiltersFeature.ts";
import { createSearchFeature } from "../features/searchFilterFeature.ts";
import type { ColumnId, Table, TableColumn } from "../types.ts";

export const createFeatures = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  table: Table<TData, TColumns>,
  { columnFilters, externFilters, searchFilter }: TableOptions<TData, TColumns>["options"],
): Table<TData, TColumns>["features"] => ({
  columnFilters: createColumnFiltersFeature(table, columnFilters),
  externFilters: createExternFiltersFeature(table, externFilters),
  searchFilter: createSearchFeature(table, searchFilter),
});
