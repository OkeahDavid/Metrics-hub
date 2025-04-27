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
            // Stale time of 1 minute by default
            staleTime: 1000 * 60,
            // Retry failed requests 1 time by default
            retry: 1,
            // Refetch data when the window regains focus
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}