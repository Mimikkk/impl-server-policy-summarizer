import equals from "react-fast-compare";

export const memoize = <TFn extends (...args: any[]) => any>(
  fn: TFn,
  isEqual: (a: any, b: any) => boolean = equals,
): TFn => {
  const cache = new Map<string, ReturnType<TFn>>();

  return ((...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as TFn;
};
