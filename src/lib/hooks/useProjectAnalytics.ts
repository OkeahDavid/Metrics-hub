'use client';

import { useQuery } from '@tanstack/react-query';

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

/**
 * Custom hook for fetching project analytics data with React Query
 * Provides automatic caching and background refetching
 */
export function useProjectAnalytics(projectId: string) {
  // Fetch unified analytics data
  const analytics = useQuery({
    queryKey: ['analytics', projectId],
    queryFn: async (): Promise<UnifiedAnalyticsData> => {
      const params = new URLSearchParams({
        all: 'true',
      });
      
      try {
        const response = await fetch(`/api/projects/${projectId}/analytics?${params}`, {
          cache: 'default'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Analytics API error:', errorText);
          throw new Error(`Failed to fetch analytics data: ${response.status}`);
        }
        
        const data = await response.json();
        const result = data.success ? data.data : data;
        
        // Validate returned data structure
        if (!result || 
            !Array.isArray(result.pageViews) || 
            !Array.isArray(result.deviceTypes) || 
            !Array.isArray(result.referrers) || 
            !Array.isArray(result.topPages) || 
            !Array.isArray(result.countries)) {
          console.error('Invalid analytics data structure:', result);
          throw new Error('Invalid analytics data structure returned from API');
        }
        
        return result;
      } catch (error) {
        console.error('Analytics fetch error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
  });

  // Fetch live visitors
  const liveVisitors = useQuery({
    queryKey: ['analytics', projectId, 'liveVisitors'],
    queryFn: async (): Promise<number> => {
      const response = await fetch(`/api/projects/${projectId}/live-visitors`, {
        cache: 'default'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch live visitors data');
      }
      const data = await response.json();
      return data.success ? data.data.count : data.count;
    },
    staleTime: 60 * 1000, // 60 seconds
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

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
    }
  };
}