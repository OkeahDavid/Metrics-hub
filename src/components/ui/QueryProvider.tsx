'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider component for the application
 * Provides caching and data fetching optimizations
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  // Create a client for each user session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Increase stale time to reduce unnecessary refetches
            staleTime: 1000 * 60 * 5, // 5 minutes
            // Retry failed requests only once
            retry: 1,
            // Only refetch data when window regains focus and data is stale
            refetchOnWindowFocus: 'always',
            // Add cacheTime
            gcTime: 1000 * 60 * 10, // 10 minutes
            // Prevent React Query from continuously refetching data
            refetchInterval: false
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}