import type {
  ComponentType,
  Context as ReactContext,
  FC,
  PropsWithChildren,
  Provider,
  ReactNode,
  RefObject,
} from "react";
import {
  createContext as createReactContext,
  createElement,
  memo,
  useContext as useReactContext,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { unstable_NormalPriority as NormalPriority, unstable_runWithPriority as runWithPriority } from "scheduler";

const ContentsSymbol = Symbol.for("ContextContents");
const ProviderSymbol = Symbol.for("ContextProvider");

type Version = number;
type Listener<Value> = (action: { n: Version; p?: Promise<Value>; v?: Value }) => void;

interface ContextValue<Value> {
  [ContentsSymbol]: {
    v: RefObject<Value>;
    n: RefObject<Version>;
    l: Set<Listener<Value>>;
    u: (fn: () => void, options?: { suspense: boolean }) => void;
  };
}

export interface Context<Value> {
  Provider: ComponentType<{ value: Value; children: ReactNode }>;
  displayName?: string;
}

const createProvider = <Value,>(Provider: Provider<ContextValue<Value>>) =>
  function ContextProvider({ value, children }: { value: Value; children: ReactNode }) {
    const valueRef = useRef(value);
    const versionRef = useRef(0);

    const [resolve, setResolve] = useState<((v: Value) => void) | null>(null);
    if (resolve) {
      resolve(value);
      setResolve(null);
    }

    const contextValue = useRef<ContextValue<Value>>(undefined);
    if (!contextValue.current) {
      const listeners = new Set<Listener<Value>>();
      const update = (fn: () => void, options?: { suspense: boolean }) => {
        versionRef.current += 1;
        const action: Parameters<Listener<Value>>[0] = {
          n: versionRef.current,
        };

        if (options?.suspense) {
          // this is intentional to make it temporary version
          action.n *= -1;

          action.p = new Promise<Value>((resolve) => {
            setResolve(() => (v: Value) => {
              action.v = v;

              delete action.p;
              resolve(v);
            });
          });
        }
        listeners.forEach((listener) => listener(action));
        fn();
      };

      contextValue.current = {
        [ContentsSymbol]: {
          v: valueRef,
          n: versionRef,
          l: listeners,
          u: update,
        },
      };
    }

    useLayoutEffect(() => {
      valueRef.current = value;
      versionRef.current += 1;
      runWithPriority(NormalPriority, () => {
        const context = { n: versionRef.current, v: value };

        for (const listener of (contextValue.current as ContextValue<Value>)[ContentsSymbol].l) {
          listener(context);
        }
      });
    }, [value]);

    return createElement(Provider, { value: contextValue.current }, children);
  };

export function createContext<Value>(values: Value) {
  const context = createReactContext<ContextValue<Value>>({
    [ContentsSymbol]: {
      v: { current: values },
      n: { current: -1 },
      l: new Set(),
      u: (f) => f(),
    },
  });

  (
    context as unknown as { [ProviderSymbol]: Provider<ContextValue<Value>> }
  )[ProviderSymbol] = context.Provider;

  (context as unknown as Context<Value>).Provider = createProvider(
    context.Provider,
  );
  delete (context as { Consumer: unknown }).Consumer;

  return context as unknown as Context<Value>;
}

export function useContext<Value, Selected>(
  context: Context<Value>,
  selector: (value: Value) => Selected,
) {
  const values = useReactContext(
    context as unknown as ReactContext<ContextValue<Value>>,
  )[ContentsSymbol];
  if (import.meta.env.DEV) {
    if (!values) {
      throw new Error("useContextSelector requires special context");
    }
  }
  const {
    v: { current: value },
    n: { current: version },
    l: listeners,
  } = values;

  const selected = selector(value);
  const [state, dispatch] = useReducer(
    (
      prev: readonly [Value | undefined, Selected],
      action?: Parameters<Listener<Value>>[0],
    ) => {
      if (!action) {
        // case for `dispatch()` below
        return [value, selected] as const;
      }

      if ("p" in action) {
        throw action.p;
      }

      if (action.n === version) {
        if (Object.is(prev[1], selected)) {
          return prev; // bail out
        }
        return [value, selected] as const;
      }

      try {
        if ("v" in action) {
          if (Object.is(prev[0], action.v)) {
            return prev;
          }
          const nextSelected = selector(action.v as Value);
          if (Object.is(prev[1], nextSelected)) {
            return prev;
          }
          return [action.v, nextSelected] as const;
        }
      } catch {
        // ignored (stale props or some other reason)
      }

      return [...prev] as const;
    },
    [value, selected] as const,
  );

  if (!Object.is(state[1], selected)) {
    dispatch();
  }

  useLayoutEffect(() => {
    listeners.add(dispatch);

    return () => {
      listeners.delete(dispatch);
    };
  }, [listeners]);
  return state[1];
}

export function useContextUpdate<Value>(context: Context<Value>) {
  const value = useReactContext(context as unknown as ReactContext<ContextValue<Value>>)[ContentsSymbol];

  if (import.meta.env.DEV) {
    if (!value) {
      throw new Error("useContextUpdate requires special context");
    }
  }

  const { u: update } = value;

  return update;
}

const HmrSnapshots = new WeakMap<Context<any>, any>();

export type CreateContextResult<T, O> = [
  use: <Y = T>(state: (value: T) => Y) => Y,
  Provider: FC<PropsWithChildren<O>>,
  Context: Context<T>,
];
export const createContext2 = <T, O>(provider: (options: O) => T): CreateContextResult<T, O> => {
  const Context = createContext<T>(undefined as unknown as T);

  return [
    function use(selector) {
      const context = useContext(Context, selector);

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
