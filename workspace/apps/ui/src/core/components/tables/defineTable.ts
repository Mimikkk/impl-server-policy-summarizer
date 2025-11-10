import type { Nil } from "@utilities/common.ts";
import { createStore } from "@utilities/defineStore.ts";
import type { HTMLAttributes } from "react";
import { createColumns } from "./composites/columns.ts";
import { createFeatures } from "./composites/features.ts";
import { createRefs } from "./composites/refs.ts";
import { createRows } from "./composites/rows.ts";
import type { ColumnFiltersFeature } from "./features/columnFiltersFeature.ts";
import type { SearchFilterFeature } from "./features/searchFilterFeature.ts";
import type { FeatureOptionsOf } from "./features/tableFeature.ts";
import type { ColumnId, Table, TableColumn, TableState } from "./types.ts";

export interface TableOptions<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  data: TData[];
  columns: TColumns;
  options: {
    searchFilter: FeatureOptionsOf<SearchFilterFeature>;
    columnFilters: FeatureOptionsOf<ColumnFiltersFeature<TData>>;
  };
  props?: {
    bodyRow: Nil<HTMLAttributes<HTMLTableSectionElement>>;
  };
}

export const defineTable = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  {
    data: initialData,
    columns,
    props,
    options,
  }: TableOptions<
    TData,
    TColumns
  >,
): Table<TData, TColumns> => {
  const defaultState = {
    data: initialData,
    columns,
    features: { searchFilter: { value: "" }, columnFilters: { record: {} } },
  } as TableState<TData, TColumns>;

  const self = {
    store: createStore({
      data: structuredClone(defaultState.data),
      columns,
      features: structuredClone(defaultState.features),
    }),
    defaultState,
    props: props ?? { bodyRow: undefined },
  } as Table<TData, TColumns>;
  self.features = createFeatures(self, options);
  self.columns = createColumns(self);
  self.rows = createRows(self);
  self.refs = createRefs(self);

  return self;
};
