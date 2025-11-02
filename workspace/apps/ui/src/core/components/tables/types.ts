import type { Nil } from "@utilities/common.ts";
import type { Store } from "@utilities/defineStore.ts";
import type { FC, HTMLAttributes } from "react";
import type { ColumnFiltersFeature } from "./features/columnFiltersFeature.ts";
import type { SearchFilterFeature } from "./features/searchFilterFeature.ts";
import type { FeatureContentOf, FeatureStateOf } from "./features/tableFeature.ts";

export type ColumnId<TData> = keyof TData;

export interface TableColumn<TData, TColumnId extends ColumnId<TData> = ColumnId<TData>> {
  id: TColumnId;
  label: string;
  HeadRowCell: FC<{ column: TableColumn<TData, TColumnId> }>;
  BodyRowCell: FC<{ column: TableColumn<TData, TColumnId>; row: TableRow<TData> }>;
  FootRowCell: FC<{ column: TableColumn<TData, TColumnId>; data: TData[TColumnId][] }>;
  searchFilter: (value: TData[TColumnId], query: string) => boolean;
  columnFilter: (value: TData[TColumnId], query: string) => boolean;
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
    searchFilter: FeatureStateOf<SearchFilterFeature>;
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
    searchFilter: FeatureContentOf<SearchFilterFeature>;
    columnFilters: FeatureContentOf<ColumnFiltersFeature<TData>>;
  };
  columns: {
    all: () => TColumns;
  };
  rows: {
    all: () => TableRow<TData>[];
    filtered: () => TableRow<TData>[];
  };
  props: {
    bodyRow: Nil<HTMLAttributes<HTMLTableSectionElement>>;
  };
}
