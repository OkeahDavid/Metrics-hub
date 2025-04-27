'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
  page: string;
  count: number;
}

interface CountryData {
  country: string;
  count: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Custom hook for fetching project analytics data with React Query
 * Provides automatic caching and background refetching
 */
export function useProjectAnalytics(projectId: string) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date()
  });

  // Convert dates to ISO strings for API calls
  const fromDate = dateRange.from.toISOString();
  const toDate = dateRange.to.toISOString();

  // Fetch page views data
  const pageViews = useQuery({
    queryKey: ['analytics', projectId, 'pageViews', fromDate, toDate],
    queryFn: async (): Promise<PageViewsData[]> => {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      });
      const response = await fetch(`/api/projects/${projectId}/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch page views data');
      }
      const data = await response.json();
      return data.success ? data.data : data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch device types data
  const deviceTypes = useQuery({
    queryKey: ['analytics', projectId, 'deviceTypes', fromDate, toDate],
    queryFn: async (): Promise<DeviceTypeData[]> => {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      });
      const response = await fetch(`/api/projects/${projectId}/device-types?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch device types data');
      }
      const data = await response.json();
      return data.success ? data.data : data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch referrers data
  const referrers = useQuery({
    queryKey: ['analytics', projectId, 'referrers', fromDate, toDate],
    queryFn: async (): Promise<ReferrerData[]> => {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      });
      const response = await fetch(`/api/projects/${projectId}/referrers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch referrers data');
      }
      const data = await response.json();
      return data.success ? data.data : data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch top pages data
  const topPages = useQuery({
    queryKey: ['analytics', projectId, 'topPages', fromDate, toDate],
    queryFn: async (): Promise<TopPageData[]> => {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      });
      const response = await fetch(`/api/projects/${projectId}/top-pages?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top pages data');
      }
      const data = await response.json();
      return data.success ? data.data : data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch countries data
  const countries = useQuery({
    queryKey: ['analytics', projectId, 'countries', fromDate, toDate],
    queryFn: async (): Promise<CountryData[]> => {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate
      });
      const response = await fetch(`/api/projects/${projectId}/countries?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch countries data');
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

  return {
    pageViews: {
      data: pageViews.data,
      isLoading: pageViews.isLoading,
      error: pageViews.error,
    },
    deviceTypes: {
      data: deviceTypes.data,
      isLoading: deviceTypes.isLoading,
      error: deviceTypes.error,
    },
    referrers: {
      data: referrers.data,
      isLoading: referrers.isLoading,
      error: referrers.error,
    },
    topPages: {
      data: topPages.data,
      isLoading: topPages.isLoading,
      error: topPages.error,
    },
    countries: {
      data: countries.data,
      isLoading: countries.isLoading,
      error: countries.error,
    },
    liveVisitors: {
      data: liveVisitors.data,
      isLoading: liveVisitors.isLoading,
      error: liveVisitors.error,
    },
    dateRange,
    setDateRange,
  };
}