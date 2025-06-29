import type { Context, FC, PropsWithChildren } from "react";
import { createContext as createReactContext, memo, useContext } from "react";

const HmrSnapshots = new WeakMap<Context<any>, any>();

export type CreateContextResult<T, O> = [use: () => T, Provider: FC<PropsWithChildren<O>>, Context: Context<T>];
export const createContext = <T, O>(provider: (options: O) => T): CreateContextResult<T, O> => {
  const Context = createReactContext<T>(undefined as unknown as T);

  return [
    function use() {
      const context = useContext(Context);

      if (context === undefined) {
        if (HmrSnapshots.has(Context)) return HmrSnapshots.get(Context);
        throw Error(`useContext must be used within the '${provider.name || "unnamed"}' Provider`);
      }
      HmrSnapshots.set(Context, context);

      return context;
    },
    memo(function Provider({ children, ...options }) {
      return <Context.Provider value={provider(options as O)}>{children}</Context.Provider>;
    }),
    Context,
  ];
};
