import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient singleton usado pela aplicação.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
    },
    mutations: {
      retry: 0,
    },
  },
});