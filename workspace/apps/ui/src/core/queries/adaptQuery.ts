import { client } from "@configs/react-query/ReactQuery.tsx";
import type {
  QueryClient,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Prettify, upperFirst } from "@utilities/common.ts";

type Method = (...params: any[]) => any;

const buster: string = "adapt-query";
type ClientRecord<K extends string = string> = Record<K, Method>;
type ClientKey<T> = { [K in keyof T]: T[K] extends Method ? K : never }[keyof T] & string;

type MethodKey<M extends Method> = (...params: Parameters<M>) => QueryKey;
type PartialMethodKey<M extends Method> = (...params: Partial<Parameters<M>>) => QueryKey;

type MutationOptions<
  TClient extends ClientRecord<TKey>,
  TKey extends ClientKey<TClient>,
  TContext extends AdaptResult<TClient, any, any>,
> =
  & Omit<
    UseMutationOptions<Awaited<ReturnType<TClient[TKey]>>, Error, Parameters<TClient[TKey]>>,
    "mutationKey" | "mutationFn"
  >
  & {
    toInvalidate: (values: {
      data: Awaited<ReturnType<TClient[TKey]>>;
      variables: Parameters<TClient[TKey]>;
      client: QueryClient;
      context: TContext;
    }) => Promise<QueryKey[]> | QueryKey[];
  };

interface AdaptMutationOptions<M extends Method>
  extends Omit<UseMutationOptions<Awaited<ReturnType<M>>, Error, Parameters<M>>, "mutationKey" | "mutationFn"> {
}

interface AdaptMutationResult<M extends Method> {
  (options?: AdaptMutationOptions<M>): UseMutationResult<Awaited<ReturnType<M>>, Error, Parameters<M>>;
}

const adaptToMutation = <
  TClient extends ClientRecord<TKey>,
  TKey extends ClientKey<TClient>,
  TContext extends AdaptResult<TClient, any, any>,
>(
  method: TClient[TKey],
  options: MutationOptions<TClient, TKey, TContext>,
  context: TContext,
): AdaptMutationResult<TClient[TKey]> => {
  return (mutationOptions) => {
    const client = useQueryClient();

    return useMutation({
      ...options,
      ...mutationOptions,
      mutationFn: (variables) => method(...variables),
      async onSuccess(data, variables, successContext) {
        const toInvalidate = await options.toInvalidate({ data, variables, client, context });
        await Promise.all(toInvalidate.map((key) => client.invalidateQueries({ queryKey: key })));

        return await Promise.all([
          options.onSuccess?.(data, variables, successContext),
          mutationOptions?.onSuccess?.(data, variables, successContext),
        ]);
      },
    });
  };
};

interface QueryOptions<TClient extends ClientRecord<TKey>, TKey extends ClientKey<TClient>> extends
  Omit<
    UseQueryOptions<Awaited<ReturnType<TClient[TKey]>>, Error, Awaited<ReturnType<TClient[TKey]>>>,
    "queryKey" | "queryFn" | "select"
  > {}

export type AdaptQueryResult<M extends Method> = <TSelect = Awaited<ReturnType<M>>>(
  ...params: [
    ...Parameters<M>,
    options?: Omit<UseQueryOptions<NoInfer<Awaited<ReturnType<M>>>, Error, TSelect>, "queryKey" | "queryFn">,
  ]
) => UseQueryResult<TSelect, Error>;

const adaptToQuery = <TClient extends ClientRecord<TKey>, TKey extends ClientKey<TClient>>(
  method: TClient[TKey],
  options: QueryOptions<TClient, TKey>,
  key: MethodKey<TClient[TKey]>,
): AdaptQueryResult<TClient[TKey]> =>
(...params) => {
  if (params.length > method.length) {
    options = { ...options, ...params.pop() };
  }

  return useQuery({
    ...options,
    queryKey: key(...(params as never)),
    queryFn: () => method(...params),
  });
};

interface AdaptOptions<
  TClient extends ClientRecord<MKey | QKey>,
  MKey extends ClientKey<TClient>,
  QKey extends ClientKey<TClient>,
> {
  prefix: string;
  client: TClient;
  mutations: { [K in MKey]: MutationOptions<TClient, K, AdaptResult<TClient, MKey, QKey>> };
  queries: { [K in QKey]: QueryOptions<TClient, K> };
}

type AdaptResult<
  TClient extends ClientRecord<TQueryKey | TMutationKey>,
  TMutationKey extends ClientKey<TClient>,
  TQueryKey extends ClientKey<TClient>,
> = Prettify<
  & {
    [K in TQueryKey as `use${Capitalize<K>}`]: AdaptQueryResult<TClient[K]>;
  }
  & {
    [K in TMutationKey as `use${Capitalize<K>}`]: AdaptMutationResult<TClient[K]>;
  }
  & {
    [K in TQueryKey as `${K}Key`]: PartialMethodKey<TClient[K]>;
  }
  & {
    [K in TQueryKey as `${K}Invalidate`]: (
      ...params: Parameters<TClient[K]>
    ) => Awaited<ReturnType<TClient[K]>> | undefined;
  }
  & {
    key(): QueryKey;
  }
>;

export const adaptQuery = <
  TClient extends ClientRecord<TQueryKey | TMutationKey>,
  TMutationKey extends ClientKey<TClient>,
  TQueryKey extends ClientKey<TClient>,
>(
  options: AdaptOptions<TClient, TMutationKey, TQueryKey>,
): AdaptResult<TClient, TMutationKey, TQueryKey> => {
  const allKey = [buster, options.prefix];

  const result = {
    key: function key() {
      return allKey;
    },
  } as any;

  for (const name in options.queries) {
    const originalFn = options.client[name];
    const originalOptions = options.queries[name];
    const queryKey = [...allKey, name];

    const keyName = `${name}Key`;
    const keyFn = (...params: unknown[]) => [...queryKey, ...params];
    Object.defineProperty(keyFn, "name", { value: keyName });

    const dataName = `${name}Data`;
    const dataFn = (...params: unknown[]) => client.getQueryData(keyFn(...params));
    Object.defineProperty(dataFn, "name", { value: dataName });
    const invalidateName = `${name}Invalidate`;

    const invalidateFn = (...params: unknown[]) => client.invalidateQueries({ queryKey: keyFn(...params) });
    Object.defineProperty(invalidateFn, "name", { value: invalidateName });

    const queryName = `use${upperFirst(name)}`;
    const queryFn = adaptToQuery(originalFn, originalOptions, keyFn);
    Object.defineProperty(queryFn, "name", { value: queryName });

    result[keyName] = keyFn;
    result[dataName] = dataFn;
    result[queryName] = queryFn;
    result[invalidateName] = invalidateFn;
  }

  for (const name in options.mutations) {
    const originalFn = options.client[name];
    const originalOptions = options.mutations[name];

    const mutationName = `use${upperFirst(name)}`;
    const mutationFn = adaptToMutation(originalFn, originalOptions, result);
    Object.defineProperty(mutationFn, "name", { value: mutationName });

    result[mutationName] = mutationFn;
  }

  return result as any;
};
