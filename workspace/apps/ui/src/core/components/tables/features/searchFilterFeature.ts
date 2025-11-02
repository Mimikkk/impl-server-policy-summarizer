import type { ColumnId, Table, TableColumn } from "../types.ts";
import type { FeatureContentOf, FeatureOptionsOf, TableFeature } from "./tableFeature.ts";

export interface SearchFilterFeature extends
  TableFeature<
    {
      get: () => string;
      set: (value: string) => void;
    },
    { value: string },
    { value: string }
  > {}

export const createSearchFeature = <TData, TColumns extends TableColumn<TData, ColumnId<TData>>[]>(
  api: Table<TData, TColumns>,
  options: FeatureOptionsOf<SearchFilterFeature>,
): FeatureContentOf<SearchFilterFeature> => {
  api.store.get().features.searchFilter.value = options.value;

  return {
    get: () => api.store.get().features.searchFilter.value,
    set: (value) =>
      api.store.set((previous) => ({
        ...previous,
        features: {
          ...previous.features,
          searchFilter: { ...previous.features.searchFilter, value },
        },
      })),
  };
};
