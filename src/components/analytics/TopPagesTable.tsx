// components/analytics/TopPagesTable.tsx
'use client';

import { useEffect, useState } from 'react';

interface PageData {
  path: string;
  count: number;
  percentage: number;
}

interface TopPagesTableProps {
  projectId: string;
}

export default function TopPagesTable({ projectId }: TopPagesTableProps) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/top-pages`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch page data');
        }
        
        const data = await response.json();
        setPages(data.pages);
      } catch (err) {
        setError('Failed to load page data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg text-black font-medium mb-4">Most Visited Pages</h3>
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg text-black font-medium mb-4">Most Visited Pages</h3>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg text-black font-medium mb-4">Most Visited Pages</h3>
      
      {pages.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No page data available yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.path}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {page.path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}