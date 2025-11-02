export function memo<TInput extends readonly unknown[], TResult>(
  readDeps: () => [...TInput],
  fn: (...args: NoInfer<[...TInput]>) => TResult,
): () => TResult {
  let deps: unknown[] = [];
  let result!: TResult;

  return () => {
    const dependencies = readDeps();
    const isChanged = dependencies.length !== deps.length || dependencies.some((dep, i) => deps[i] !== dep);

    if (!isChanged) {
      return result;
    }

    deps = dependencies;
    result = fn(...dependencies);

    return result;
  };
}
