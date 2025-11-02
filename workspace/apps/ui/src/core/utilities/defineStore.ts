import { useCompare } from "@hooks/useCompare.ts";
import type { Updater } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";
import equals from "react-fast-compare";
import { identity } from "./common.ts";

export interface Store<TState> {
  listeners: Set<() => void>;
  get: () => TState;
  set: (state: Updater<TState, TState>) => void;
  subscribe: (callback: () => void) => () => void;
  use: <TResult = TState>(
    selector?: (state: TState) => TResult,
    isEqual?: (a: TResult, b: TResult) => boolean,
  ) => TResult;
}

export const createStore = <TState,>(initialState: TState): Store<TState> => {
  const listeners = new Set<() => void>();
  let state = initialState;

  const store: Store<TState> = {
    listeners,
    get: () => state,
    set: (updater) => {
      state = { ...state, ...(updater instanceof Function ? updater(state) : updater) };

      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    use: (selector = identity, isEqual = equals) => {
      const select = useCallback(() => selector(store.get()), [selector]);

      return useCompare(useSyncExternalStore(store.subscribe, select), isEqual);
    },
  };

  return store;
};
