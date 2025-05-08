'use client';

import { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PageViewsData {
  date: string;
  count: number;
}

interface PageViewsChartProps {
  projectId: string;
  days?: number | 'all';
}

export default function PageViewsChart({ projectId, days = 7 }: PageViewsChartProps) {
  const [pageViewsData, setPageViewsData] = useState<PageViewsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [error, setError] = useState('');
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Handle the 'all' case by not including the days parameter
        const url = days === 'all' 
          ? `/api/projects/${projectId}/analytics?all=true` 
          : `/api/projects/${projectId}/analytics?days=${days}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        // Handle both the new standardized format and the old format
        const pageViews = data.success ? data.data : data.dailyPageViews;
        setPageViewsData(pageViews);
        
        // Calculate total views for the period
        const total = pageViews.reduce((sum: number, item: PageViewsData) => sum + item.count, 0);
        setTotalViews(total);
      } catch (err) {
        setError('Failed to load chart data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, days]);

  // If no data yet, provide empty dates for the last N days
  const ensureDataForAllDays = () => {
    if (pageViewsData.length === 0) {
      // Only create default data for numeric day ranges
      if (days !== 'all') {
        const endDate = new Date();
        const startDate = subDays(endDate, Number(days) - 1);
        
        return eachDayOfInterval({ start: startDate, end: endDate })
          .map(date => ({
            date: format(date, 'yyyy-MM-dd'),
            count: 0
          }));
      }
      return [{ date: format(new Date(), 'yyyy-MM-dd'), count: 0 }];
    }
    
    return pageViewsData;
  };

  // Chart configuration with dark mode support
  const chartData = {
    labels: ensureDataForAllDays().map(item => format(new Date(item.date), 'MMM d')),
    datasets: [
      {
        label: 'Page Views',
        data: ensureDataForAllDays().map(item => item.count),
        fill: false,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(229, 231, 235)' // text-gray-200
        }
      },
      title: {
        display: true,
        text: days === 'all' ? 'Page Views - All Time' : `Page Views - Last ${days} Days`,
        color: 'rgb(229, 231, 235)' // text-gray-200
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: 'rgb(209, 213, 219)' // text-gray-300
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)' // gray-600 with opacity
        }
      },
      x: {
        ticks: {
          color: 'rgb(209, 213, 219)' // text-gray-300
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)' // gray-600 with opacity
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-40"></div>
          <div className="inline-flex rounded-md shadow-sm bg-gray-700 h-8 w-32 animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center bg-gray-800 text-red-400">{error}</div>;
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg text-gray-100 font-medium">
          Total: <span className="text-indigo-400">{totalViews} views</span>
        </div>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setChartType('line')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              chartType === 'line'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Line
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              chartType === 'bar'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      <div className="h-64">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}