import type { ColumnId, TableColumn, TableStore } from "../types.ts";
import type { FeatureContentOf, FeatureOptionsOf, TableFeature } from "./tableFeature.ts";

export interface SearchFeature extends
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
  options: FeatureOptionsOf<SearchFeature>,
): FeatureContentOf<SearchFeature> => {
  store.get().features.search.value = options.value;

  return {
    get: () => store.get().features.search.value,
    set: (value) => store.set((previous) => ({ ...previous, search: { value } })),
  };
};
