import { type EliClient, EliQuery } from "@features/eli/EliClient.ts";
import { useQuery } from "@tanstack/react-query";
import type { Nil } from "@utilities/common.ts";
import { useMemo } from "react";

export const useEliAct = (params: EliClient.ActParams) =>
  EliQuery.useAct(params, { enabled: !!params.publisher && !!params.year && !!params.position });

export const useEliActHTML = (params: EliClient.ActParams) =>
  EliQuery.useHtml(params, { enabled: !!params.publisher && !!params.year && !!params.position });

export const useEliActHTMLText = (params: EliClient.ActParams) => {
  const { data: html } = useEliActHTML(params);

  return useQuery({ queryKey: ["txt", html], queryFn: () => html?.text(), enabled: !!html });
};

export const useEliPublishers = EliQuery.usePublishers;

export const useEliPublisher = (publisherId: Nil<string>) =>
  EliQuery.usePublisher({ publisher: publisherId! }, { enabled: !!publisherId });

export const useEliYear = (publisherId: Nil<string>, year: Nil<number>) =>
  EliQuery.useYear({ publisher: publisherId!, year: year! }, { enabled: !!publisherId && !!year });

interface UseOptionsOptions<T> {
  valueBy: (item: T) => string;
  labelBy: (item: T) => string;
  sortBy?: (a: T, b: T) => number;
}

export const defineUseOptions = <T>({ valueBy, labelBy, sortBy }: UseOptionsOptions<T>) => (items: Nil<T[]>) =>
  useMemo(
    () => {
      const sorted = (sortBy ? items?.sort(sortBy) : items) ?? [];
      return sorted.map((item) => ({ value: valueBy(item), label: labelBy(item) }));
    },
    [items],
  );
