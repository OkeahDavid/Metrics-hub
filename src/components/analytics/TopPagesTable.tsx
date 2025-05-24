'use client';

interface PageData {
  path: string;
  count: number;
  percentage: number;
}

interface TopPagesTableProps {
  analytics?: { topPages?: PageData[] };
  isLoading?: boolean;
  error?: string;
}

export default function TopPagesTable({ analytics, isLoading, error }: TopPagesTableProps) {
  const pages = analytics?.topPages || [];

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg text-gray-100 font-medium mb-4">Most Visited Pages</h3>
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-700 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-lg text-gray-100 font-medium mb-4">Most Visited Pages</h3>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg text-gray-100 font-medium mb-4">Most Visited Pages</h3>
      
      {pages.length === 0 ? (
        <div className="text-center text-gray-400 py-4">No page data available yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Page
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {pages.map((page, index) => (
                <tr key={`${page.path}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {page.path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {page.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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