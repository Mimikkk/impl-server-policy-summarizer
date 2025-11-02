import type { Nil } from "@utilities/common.ts";
import { createStore } from "@utilities/defineStore.ts";
import { memo } from "@utilities/memo.ts";
import type { HTMLAttributes } from "react";
import { type ColumnFiltersFeature, createColumnFiltersFeature } from "./features/columnFiltersFeature.ts";
import { createSearchFeature, type SearchFilterFeature } from "./features/searchFilterFeature.ts";
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
    tbody: Nil<HTMLAttributes<HTMLTableSectionElement>>;
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

  const store = createStore({
    data: structuredClone(defaultState.data),
    columns,
    features: structuredClone(defaultState.features),
  });

  const self: Table<TData, TColumns> = {
    store,
    defaultState,
    features: {
      searchFilter: createSearchFeature(store, options.searchFilter),
      columnFilters: createColumnFiltersFeature(store, options.columnFilters),
    },
    rows: {
      all: memo(
        () => [store.get().data],
        (data) => data.map((data, index) => ({ values: data, id: `${index}`, index })),
      ),
      filtered: memo(
        () => [
          self.rows.all(),
          self.store.get().columns,
          self.features.searchFilter.get(),
          self.features.columnFilters.get(),
        ],
        (rows, columns, searchFilter, columnFilters) => {
          const result = [];
          filter_it: for (let i = 0; i < rows.length; ++i) {
            const row = rows[i];
            const values = row.values;
            console.log(values);

            for (const columnId in columnFilters) {
              const query = columnFilters[columnId]?.toLowerCase().trim() ?? "";
              const column = columns.find(({ id }) => id === columnId);
              if (!column) continue;

              if (column.columnFilter(values[columnId]!, query)) continue;
              continue filter_it;
            }

            if (searchFilter) {
              const query = searchFilter.toLowerCase().trim();
              if (!columns.some(({ searchFilter: filter, id }) => filter(values[id]!, query))) continue filter_it;
            }

            result.push(row);
          }

          return result;
        },
      ),
    },
    props: props ?? { tbody: undefined },
  };

  return self;
};
