'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { subDays } from 'date-fns';

// Define types for analytics data
interface PageViewsData {
  date: string;
  count: number;
}

interface DeviceTypeData {
  deviceType: string;
  count: number;
}

interface ReferrerData {
  referrer: string;
  count: number;
}

interface TopPageData {
  path: string;
  count: number;
  percentage: number;
}

interface CountryData {
  country: string;
  count: number;
}

export interface UnifiedAnalyticsData {
  pageViews: PageViewsData[];
  deviceTypes: DeviceTypeData[];
  referrers: ReferrerData[];
  topPages: TopPageData[];
  countries: CountryData[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Custom hook for fetching project analytics data with React Query
 * Provides automatic caching and background refetching
 */
export function useProjectAnalytics(projectId: string) {
  const queryClient = useQueryClient();
  const [isChangingRange, setIsChangingRange] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 6), // Last 7 days including today
    to: new Date()
  });

  // Convert dates to ISO strings for API calls
  const fromDate = dateRange.from.toISOString();
  const toDate = dateRange.to.toISOString();

  // Enhanced date range setter with loading state
  const updateDateRange = useCallback((newRange: DateRange) => {
    setIsChangingRange(true);
    setDateRange(newRange);
  }, []);

  // This effect will prefetch data for common date ranges to improve performance
  useEffect(() => {
    // Prefetch data for common date ranges
    const prefetchCommonRanges = async () => {
      const now = new Date();
      const commonRanges = [
        { from: subDays(now, 6), to: now }, // 7 days
        { from: subDays(now, 13), to: now }, // 14 days
        { from: subDays(now, 29), to: now }, // 30 days
      ];

      for (const range of commonRanges) {
        const fromString = range.from.toISOString();
        const toString = range.to.toISOString();
        
        // Prefetch page views data for this range
        queryClient.prefetchQuery({
          queryKey: ['analytics', projectId, 'pageViews', fromString, toString],
          queryFn: async () => {
            const params = new URLSearchParams({
              from: fromString,
              to: toString
            });
            const response = await fetch(`/api/projects/${projectId}/analytics?${params}`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.success ? data.data : data;
          },
          staleTime: 10 * 60 * 1000, // 10 minutes
        });
      }
    };

    // Only prefetch if we have a project ID and not during SSR
    if (projectId && typeof window !== 'undefined') {
      prefetchCommonRanges();
    }
  }, [projectId, queryClient]);

  // Fetch unified analytics data
  const analytics = useQuery({
    queryKey: ['analytics', projectId, fromDate, toDate],
    queryFn: async (): Promise<UnifiedAnalyticsData> => {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      });
      const response = await fetch(`/api/projects/${projectId}/analytics?${params}`, {
        cache: 'force-cache'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data = await response.json();
      return data.success ? data.data : data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch live visitors data - shorter stale time
  const liveVisitors = useQuery({
    queryKey: ['analytics', projectId, 'liveVisitors'],
    queryFn: async (): Promise<number> => {
      const response = await fetch(`/api/projects/${projectId}/live-visitors`);
      if (!response.ok) {
        throw new Error('Failed to fetch live visitors data');
      }
      const data = await response.json();
      return data.success ? data.data.count : data.count;
    },
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for live data
    refetchInterval: 30 * 1000, // Auto refetch every 30 seconds
  });

  // Detect when all queries have finished loading and reset loading state
  useEffect(() => {
    if (isChangingRange && !analytics.isLoading) {
      setIsChangingRange(false);
    }
  }, [isChangingRange, analytics.isLoading]);

  // Calculate overall loading state
  const isLoading = isChangingRange || analytics.isLoading;

  // Provide unified analytics data to consumers
  return {
    analytics: {
      data: analytics.data,
      isLoading: analytics.isLoading,
      error: analytics.error,
    },
    liveVisitors: {
      data: liveVisitors.data,
      isLoading: liveVisitors.isLoading,
      error: liveVisitors.error,
    },
    dateRange,
    setDateRange: updateDateRange,
    isLoading,
  };
}