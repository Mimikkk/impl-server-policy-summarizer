import type { ColumnId, Table, TableColumn } from "../types.ts";

export const createColumns = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  api: Table<TData, TColumns>,
): Table<TData, TColumns>["columns"] => ({
  all: () => api.store.get().columns,
});
