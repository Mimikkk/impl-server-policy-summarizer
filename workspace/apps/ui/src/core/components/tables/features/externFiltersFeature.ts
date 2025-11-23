import type { ColumnId, Table, TableColumn, TableRow } from "../types.ts";
import type { FeatureContentOf, FeatureOptionsOf, TableFeature } from "./tableFeature.ts";

export type ExternFilter<TData> = (row: TableRow<TData>, value: string) => boolean;
export type ExternFilterList<TData> = ExternFilter<TData>[];
export interface ExternFiltersFeature<TData> extends
  TableFeature<
    {
      get: () => ExternFilterList<TData>;
      set: (value: ExternFilterList<TData>) => void;
      add: (value: ExternFilter<TData>) => void;
      remove: (value: ExternFilter<TData>) => void;
    },
    { list: ExternFilterList<TData> },
    { list: ExternFilterList<TData> }
  > {}

export const createExternFiltersFeature = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  api: Table<TData, TColumns>,
  options: FeatureOptionsOf<ExternFiltersFeature<TData>>,
): FeatureContentOf<ExternFiltersFeature<TData>> => {
  api.store.get().features.externFilters.list = options.list;

  return ({
    get: () => api.store.get().features.externFilters.list,
    set: (value) =>
      api.store.set((previous) => ({
        ...previous,
        features: {
          ...previous.features,
          externFilters: { ...previous.features.externFilters, list: value },
        },
      })),
    remove: (filter) =>
      api.store.set((previous) => ({
        ...previous,
        features: {
          ...previous.features,
          externFilters: {
            ...previous.features.externFilters,
            list: previous.features.externFilters.list.filter((fn) => fn !== filter),
          },
        },
      })),
    add: (filter) =>
      api.store.set((previous) => ({
        ...previous,
        features: {
          ...previous.features,
          externFilters: {
            ...previous.features.externFilters,
            list: [...previous.features.externFilters.list, filter],
          },
        },
      })),
  });
};
