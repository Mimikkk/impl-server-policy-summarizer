type ColumnId<TData> = keyof TData | (string & {});

export interface TableColumn<TData, TColumnId extends ColumnId<TData> = ColumnId<TData>> {
  id: TColumnId;
  label: string;
}

export interface TableRow<TData> {
  original: TData;
  id: string;
}

export interface Table<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  rows: TableRow<TData>[];
  columns: TColumns;
}

export interface CreateTableOptions<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  data: TData[];
  columns: TColumns;
}

export const createTable = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  { data, columns }: CreateTableOptions<TData, TColumns>,
): Table<TData, TColumns> => ({
  rows: data.map((item, index) => ({ original: item, id: index.toString() })),
  columns,
});
