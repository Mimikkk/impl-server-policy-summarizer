import type { ColumnId, TableColumn, TableStore } from "../types.ts";
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
  store: TableStore<TData, TColumns>,
  options: FeatureOptionsOf<SearchFilterFeature>,
): FeatureContentOf<SearchFilterFeature> => {
  store.get().features.searchFilter.value = options.value;

  return {
    get: () => store.get().features.searchFilter.value,
    set: (value) =>
      store.set((previous) => ({
        ...previous,
        features: {
          ...previous.features,
          searchFilter: { ...previous.features.searchFilter, value },
        },
      })),
  };
};
