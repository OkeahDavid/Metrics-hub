'use client';

import { useEffect, useState } from 'react';

interface LiveVisitorsProps {
  projectId: string;
}

export default function LiveVisitors({ projectId }: LiveVisitorsProps) {
  const [liveCount, setLiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLiveVisitors = async () => {
      try {
        // Add cache busting parameter
        const response = await fetch(`/api/projects/${projectId}/live-visitors?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch live visitors');
        }
        
        const data = await response.json();
        setLiveCount(data.count);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load live visitor data');
        console.error(err);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchLiveVisitors();
    
    // Set up interval for periodic updates - increase frequency to 10 seconds for better testing
    const intervalId = setInterval(fetchLiveVisitors, 10000); 
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-full flex items-center justify-center">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-full flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-medium text-gray-900">Live Visitors</h3>
        <div className="mt-2 text-4xl font-bold text-indigo-600">
          {liveCount}
        </div>
        <p className="mt-1 text-sm text-gray-500">currently on your site</p>
      </div>
    </div>
  );
}