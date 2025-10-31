import type { FC } from "react";

type ColumnId<TData> = keyof TData | (string & {});

export interface TableColumn<TData, TColumnId extends ColumnId<TData> = ColumnId<TData>> {
  id: TColumnId;
  label: string;
  HeaderCell: FC<{ column: TableColumn<TData, TColumnId> }>;
  RowCell: FC<{ row: TableRow<TData>; column: TableColumn<TData, TColumnId> }>;
}

export interface TableRow<TData> {
  original: TData;
  id: string;
}

export interface Table<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  rows: TableRow<TData>[];
  columns: TColumns;
  classNames?: { tbody?: string };
}

export interface CreateTableOptions<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  data: TData[];
  columns: TColumns;
  classNames?: { tbody?: string };
}

export const defineTable = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  { data, columns, classNames }: CreateTableOptions<TData, TColumns>,
): Table<TData, TColumns> => ({
  rows: data.map((item, index) => ({ original: item, id: index.toString() })),
  columns,
  classNames,
});
