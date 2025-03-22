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
  days?: number;
}

export default function PageViewsChart({ projectId, days = 7 }: PageViewsChartProps) {
  const [pageViewsData, setPageViewsData] = useState<PageViewsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/analytics?days=${days}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setPageViewsData(data.dailyPageViews);
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
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);
      
      return eachDayOfInterval({ start: startDate, end: endDate })
        .map(date => ({
          date: format(date, 'yyyy-MM-dd'),
          count: 0
        }));
    }
    
    return pageViewsData;
  };

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
      },
      title: {
        display: true,
        text: `Page Views - Last ${days} Days`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center bg-gray-50">Loading chart data...</div>;
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center bg-gray-50 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setChartType('line')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              chartType === 'line'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
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
                : 'bg-white text-gray-700 hover:bg-gray-50'
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