/**
 * TanStack Query (React Query) client configuration.
 *
 * Per ADR-007: TanStack Query is the designated server state library.
 * Per "No manual re-implementation of caching logic."
 *
 * This QueryClient is provided at the app root in app/_layout.tsx.
 * Feature hooks use useQuery / useMutation / useInfiniteQuery from this client.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (no refetch)
      staleTime: 30_000, // 30 seconds
      // How long cached data is retained when there are no active subscribers
      gcTime: 5 * 60_000, // 5 minutes
      // Retry failed requests twice before showing error state
      retry: 2,
      // Refetch when the app comes back to the foreground
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Do not retry mutations by default — side effects should not be repeated
      retry: 0,
    },
  },
});
