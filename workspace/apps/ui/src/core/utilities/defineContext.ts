import type { Context as ReactContext, FC, PropsWithChildren, RefObject } from "react";
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
import equals from "react-fast-compare";
import { unstable_NormalPriority as NormalPriority, unstable_runWithPriority as runWithPriority } from "scheduler";

type Version = number;
type ListenerAction<TValue> = { version: Version; promise?: Promise<TValue>; value?: TValue };
type Listener<TValue> = (action: ListenerAction<TValue>) => void;

interface ContextSymbolValue<TValue> {
  valueRef: RefObject<TValue>;
  versionRef: RefObject<Version>;
  listeners: Set<Listener<TValue>>;
  update: (fn: () => void, options?: UpdateOptions) => void;
}

interface ContextValue<TValue> {
  [ContentsSymbol]: ContextSymbolValue<TValue>;
}

const ContentsSymbol = Symbol.for("ContextContents");
function useContextContents<Value>(context: ReactContext<ContextValue<Value>>): ContextSymbolValue<Value> {
  return useReactContext(context as unknown as ReactContext<ContextValue<Value>>)[ContentsSymbol];
}

interface UpdateOptions {
  suspense?: boolean;
}
const createContents = <TValue>(
  versionRef: RefObject<number>,
  valueRef: RefObject<TValue>,
  setResolve: React.Dispatch<React.SetStateAction<((v: TValue) => void) | null>>,
): ContextValue<TValue> => {
  const listeners = new Set<Listener<TValue>>();

  const update = (fn: () => void, options?: UpdateOptions) => {
    versionRef.current += 1;
    const action: ListenerAction<TValue> = { version: versionRef.current };

    if (options?.suspense) {
      // this is intentional to make it temporary version
      action.version *= -1;

      action.promise = new Promise<TValue>((resolve) => {
        setResolve(() => (v: TValue) => {
          action.value = v;

          delete action.promise;
          resolve(v);
        });
      });
    }

    for (const listener of listeners) {
      listener(action);
    }

    fn();
  };

  return { [ContentsSymbol]: { valueRef, versionRef, listeners, update } };
};

function createContext<Value>(values: Value) {
  const context = createReactContext<ContextValue<Value>>({
    [ContentsSymbol]: {
      valueRef: { current: values },
      versionRef: { current: -1 },
      listeners: new Set(),
      update: (update) => update(),
    },
  });

  delete (context as { Consumer: unknown }).Consumer;

  return context as unknown as ReactContext<ContextValue<Value>>;
}

function useContextSelector<TValue, TResult>(
  context: ReactContext<ContextValue<TValue>>,
  select: (value: TValue) => TResult,
  isEqual: (a: TResult, b: TResult) => boolean,
): TResult {
  const {
    valueRef: { current: value },
    versionRef: { current: version },
    listeners,
  } = useContextContents(context);

  const result = select(value);
  const [state, dispatch] = useReducer(
    (
      previous: readonly [TValue | undefined, TResult],
      action?: ListenerAction<TValue>,
    ) => {
      if (!action) {
        return [value, result] as const;
      }

      const [previousValue, previousResult] = previous;
      if (action.promise) {
        throw action.promise;
      }

      if (action.version === version) {
        if (isEqual(previousResult, result)) {
          return previous;
        }

        return [value, result] as const;
      }

      if (action.value) {
        if (Object.is(previousValue, action.value)) {
          return previous;
        }

        const nextResult = select(action.value as TValue);
        if (isEqual(previousResult, nextResult)) {
          return previous;
        }

        return [action.value, nextResult] as const;
      }

      return [previousValue, previousResult] as const;
    },
    [value, result] as const,
  );

  if (!isEqual(state[1], result)) {
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

function useContextUpdate<Value>(
  context: ReactContext<ContextValue<Value>>,
  update: () => void,
  options?: UpdateOptions,
): void {
  return useContextContents(context).update(update, options);
}

export interface CreateContextResult<TValue, TProps> {
  use: <const TResult = TValue>(
    select?: (value: TValue) => TResult,
    isEqual?: (a: TResult, b: TResult) => boolean,
  ) => TResult;
  update: (fn: () => void, options?: UpdateOptions) => void;
  Provider: FC<PropsWithChildren<TProps>>;
}

const identity = <T, Y = T>(value: T): Y => value as unknown as Y;
export const defineContext = <TValue, TProps>(
  provider: (options: TProps) => TValue,
): CreateContextResult<TValue, TProps> => {
  const Context = createContext<TValue>(undefined!);

  return {
    use: (selector = identity, isEqual = equals) => useContextSelector(Context, selector, isEqual),
    update: (update, options) => useContextUpdate(Context, update, options),
    Provider: memo(function ContextProvider({ children, ...options }) {
      const value = provider(options as TProps);
      const valueRef = useRef(value);
      const versionRef = useRef(0);

      const [resolve, setResolve] = useState<((v: TValue) => void) | null>(null);

      if (resolve) {
        resolve(value);
        setResolve(null);
      }

      const contentsRef = useRef(createContents(versionRef, valueRef, setResolve));

      useLayoutEffect(() => {
        valueRef.current = value;
        versionRef.current += 1;

        runWithPriority(NormalPriority, () => {
          const action = { version: versionRef.current, value };

          for (const listener of contentsRef.current![ContentsSymbol].listeners) {
            listener(action);
          }
        });
      }, [value]);

      return createElement(Context.Provider, { value: contentsRef.current }, children);
    }),
  };
};
