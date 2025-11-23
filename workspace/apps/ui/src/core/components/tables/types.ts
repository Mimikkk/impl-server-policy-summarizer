import type { Nil } from "@utilities/common.ts";
import type { Store } from "@utilities/defineStore.ts";
import type { FC, HTMLAttributes } from "react";
import type { ColumnFiltersFeature } from "./features/columnFiltersFeature.ts";
import type { ExternFiltersFeature } from "./features/externFiltersFeature.ts";
import type { SearchFilterFeature } from "./features/searchFilterFeature.ts";
import type { FeatureContentOf, FeatureStateOf } from "./features/tableFeature.ts";

export type ColumnId<TData> = keyof TData;

export interface TableColumn<TData, TColumnId extends ColumnId<TData> = ColumnId<TData>> {
  id: TColumnId;
  label: string;
  HeadRowCell: FC<{ column: TableColumn<TData, TColumnId> }>;
  BodyRowCell: FC<{ column: TableColumn<TData, TColumnId>; row: TableRow<TData> }>;
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
    columnFilters: FeatureStateOf<ColumnFiltersFeature<TData>>;
    externFilters: FeatureStateOf<ExternFiltersFeature<TData>>;
    searchFilter: FeatureStateOf<SearchFilterFeature>;
  };
};

export type TableStore<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> = Store<
  TableState<TData, TColumns>
>;

export interface Table<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  store: TableStore<TData, TColumns>;
  defaultState: TableState<TData, TColumns>;
  features: {
    columnFilters: FeatureContentOf<ColumnFiltersFeature<TData>>;
    externFilters: FeatureContentOf<ExternFiltersFeature<TData>>;
    searchFilter: FeatureContentOf<SearchFilterFeature>;
  };
  columns: {
    all: () => TColumns;
  };
  rows: {
    all: () => TableRow<TData>[];
    filtered: () => TableRow<TData>[];
  };
  refs: {
    table: HTMLTableElement | null;
  };
  props: {
    bodyRow: Nil<HTMLAttributes<HTMLTableSectionElement>>;
  };
}
