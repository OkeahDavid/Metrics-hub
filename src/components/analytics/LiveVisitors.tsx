'use client';

import { useProjectAnalytics } from '@/lib/hooks/useProjectAnalytics';

interface LiveVisitorsProps {
  projectId: string;
}

export default function LiveVisitors({ projectId }: LiveVisitorsProps) {
  // Using our custom React Query hook instead of useState and useEffect
  const { liveVisitors } = useProjectAnalytics(projectId);
  
  if (liveVisitors.isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-full flex items-center justify-center">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
      </div>
    );
  }

  if (liveVisitors.error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-full flex items-center justify-center text-red-500">
        Failed to load live visitor data
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-medium text-gray-900">Live Visitors</h3>
        <div className="mt-2 text-4xl font-bold text-indigo-600">
          {liveVisitors.data || 0}
        </div>
        <p className="mt-1 text-sm text-gray-500">currently on your site</p>
      </div>
    </div>
  );
}