import { memoize } from "@utilities/memoize.ts";
import type { ColumnId, TableColumn, TableStore } from "../types.ts";
import type { FeatureContentOf, FeatureOptionsOf, TableFeature } from "./tableFeature.ts";

export type FiltersRecord<TData> = Partial<Record<ColumnId<TData>, string>>;
export interface ColumnFiltersFeature<TData> extends
  TableFeature<
    {
      of: (columnId: ColumnId<TData>) => {
        get: () => string;
        set: (value: string) => void;
      };
      get: () => FiltersRecord<TData>;
      set: (value: FiltersRecord<TData>) => void;
    },
    { record: FiltersRecord<TData> },
    { record: FiltersRecord<TData> }
  > {}

export const createColumnFiltersFeature = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  store: TableStore<TData, TColumns>,
  options: FeatureOptionsOf<ColumnFiltersFeature<TData>>,
): FeatureContentOf<ColumnFiltersFeature<TData>> => {
  store.get().features.columnFilters.record = options.record;

  return ({
    of: memoize((columnId) => ({
      get: () => store.get().features.columnFilters.record[columnId] ?? "",
      set: (value) =>
        store.set((previous) => ({
          ...previous,
          features: {
            ...previous.features,
            columnFilters: {
              ...previous.features.columnFilters,
              record: { ...previous.features.columnFilters.record, [columnId]: value },
            },
          },
        })),
    })),
    get: () => store.get().features.columnFilters.record,
    set: (value) =>
      store.set((previous) => ({
        ...previous,
        features: {
          ...previous.features,
          columnFilters: { ...previous.features.columnFilters, record: value },
        },
      })),
  });
};
