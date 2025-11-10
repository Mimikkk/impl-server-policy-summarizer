import type { ColumnId, Table, TableColumn } from "../types.ts";

export const createRefs = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  _api: Table<TData, TColumns>,
): Table<TData, TColumns>["refs"] => ({
  table: null!,
});
