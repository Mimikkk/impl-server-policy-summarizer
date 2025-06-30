import { useQuery } from "@tanstack/react-query";
import type { Nil } from "@utilities/common.ts";
import ky from "ky";
import { useEffect } from "react";

export const useBlobUrl = (url: Nil<string>) => {
  const query = useQuery({
    queryKey: ["blob-url", url],
    queryFn: async () => URL.createObjectURL(await ky.get(url!).blob()),
    enabled: !!url,
  });

  useEffect(() => {
    return () => {
      if (query.data) URL.revokeObjectURL(query.data);
    };
  }, [query.data]);

  return query;
};
