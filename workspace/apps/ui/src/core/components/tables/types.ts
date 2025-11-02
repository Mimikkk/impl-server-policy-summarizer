import type { Nil } from "@utilities/common.ts";
import type { Store } from "@utilities/defineStore.ts";
import type { FC, HTMLAttributes } from "react";
import type { ColumnFiltersFeature } from "./features/columnFiltersFeature.ts";
import type { SearchFeature } from "./features/searchFeature.ts";
import type { FeatureContentOf, FeatureStateOf } from "./features/tableFeature.ts";

export type ColumnId<TData> = keyof TData;

export interface TableColumn<TData, TColumnId extends ColumnId<TData> = ColumnId<TData>> {
  id: TColumnId;
  label: string;
  HeaderCell: FC<{ column: TableColumn<TData, TColumnId> }>;
  RowCell: FC<{ row: TableRow<TData>; column: TableColumn<TData, TColumnId> }>;
}

export interface TableRow<TData> {
  values: TData;
  index: number;
  id: string;
}

export type TableState<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> = {
  data: TData[];
  columns: TColumns;
  features: {
    search: FeatureStateOf<SearchFeature>;
    columnFilters: FeatureStateOf<ColumnFiltersFeature<TData>>;
  };
};

export type TableStore<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> = Store<
  TableState<TData, TColumns>
>;

export interface Table<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  store: TableStore<TData, TColumns>;
  defaultState: TableState<TData, TColumns>;
  features: {
    search: FeatureContentOf<SearchFeature>;
    columnFilters: FeatureContentOf<ColumnFiltersFeature<TData>>;
  };
  rows: {
    all: () => TableRow<TData>[];
    visible: () => TableRow<TData>[];
    filtered: () => TableRow<TData>[];
  };
  props: {
    tbody: Nil<HTMLAttributes<HTMLTableSectionElement>>;
  };
}
