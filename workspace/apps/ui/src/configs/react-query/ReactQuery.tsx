import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { memo, type PropsWithChildren } from "react";

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: false,
    },
  },
});

export const QueryProvider = memo(({ children }: PropsWithChildren) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
));
