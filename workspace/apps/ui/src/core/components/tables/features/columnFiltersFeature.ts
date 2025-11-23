import { memoize } from "@utilities/memoize.ts";
import type { ColumnId, Table, TableColumn } from "../types.ts";
import type { FeatureContentOf, FeatureOptionsOf, TableFeature } from "./tableFeature.ts";

export type ColumnFilterRecord<TData> = Partial<Record<ColumnId<TData>, string>>;
export interface ColumnFiltersFeature<TData> extends
  TableFeature<
    {
      of: (columnId: ColumnId<TData>) => {
        get: () => string;
        set: (value: string) => void;
      };
      get: () => ColumnFilterRecord<TData>;
      set: (value: ColumnFilterRecord<TData>) => void;
    },
    { record: ColumnFilterRecord<TData> },
    { record: ColumnFilterRecord<TData> }
  > {}

export const createColumnFiltersFeature = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  api: Table<TData, TColumns>,
  options: FeatureOptionsOf<ColumnFiltersFeature<TData>>,
): FeatureContentOf<ColumnFiltersFeature<TData>> => {
  api.store.get().features.columnFilters.record = options.record;

  return ({
    of: memoize((columnId) => ({
      get: () => api.store.get().features.columnFilters.record[columnId] ?? "",
      set: (value) =>
        api.store.set((previous) => ({
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
    get: () => api.store.get().features.columnFilters.record,
    set: (value) =>
      api.store.set((previous) => ({
        ...previous,
        features: {
          ...previous.features,
          columnFilters: { ...previous.features.columnFilters, record: value },
        },
      })),
  });
};
