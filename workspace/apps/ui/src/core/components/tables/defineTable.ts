import type { Nil } from "@utilities/common.ts";
import { createStore } from "@utilities/defineStore.ts";
import { memo } from "@utilities/memo.ts";
import type { HTMLAttributes } from "react";
import { type ColumnFiltersFeature, createColumnFiltersFeature } from "./features/columnFiltersFeature.ts";
import { createSearchFeature, type SearchFeature } from "./features/searchFeature.ts";
import type { FeatureOptionsOf } from "./features/tableFeature.ts";
import type { ColumnId, Table, TableColumn, TableRow, TableState } from "./types.ts";

export interface TableOptions<TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]> {
  data: TData[];
  columns: TColumns;
  options: {
    search: FeatureOptionsOf<SearchFeature>;
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
    features: { search: { value: "" }, columnFilters: { record: {} } },
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
      search: createSearchFeature(store, options.search),
      columnFilters: createColumnFiltersFeature(store, options.columnFilters),
    },
    rows: {
      all: memo(
        () => [store.get().data],
        (data) => data.map((data, index) => ({ values: data, id: `${index}`, index })),
      ),
      filtered: memo(
        () => [self.rows.all(), self.features.search.get(), self.features.columnFilters.get()],
        (rows, value, record) => {
          const result = [];
          filter_it: for (let i = 0; i < rows.length; ++i) {
            const row = rows[i];
            const values = row.values;

            for (const key in record) {
              const columnId = key;
              const query = record[columnId]?.toLowerCase().trim();

              if (values[columnId]?.toLowerCase().includes(query)) continue;
              continue filter_it;
            }

            if (value) {
              const query = value.toLowerCase().trim();
              if (!columns.some(({ id }) => values[id]?.toLowerCase().includes(query))) continue filter_it;
            }

            result.push(row);
          }

          return result;
        },
      ),
      visible: function (): TableRow<TData>[] {
        throw new Error("Function not implemented.");
      },
    },
    props: props ?? { tbody: undefined },
  };

  return self;
};
