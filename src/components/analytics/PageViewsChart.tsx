'use client';

import { useState, useMemo } from 'react';
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
import { format, isValid } from 'date-fns';

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

interface PageViewsDataItem {
  date: string;
  count: number;
}

interface PageViewsChartProps {
  pageViewsData?: PageViewsDataItem[];
}

export default function PageViewsChart({ pageViewsData = [] }: PageViewsChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  // Process data for the chart
  const chartData = useMemo(() => {
    // Format the dates for display
    const labels = pageViewsData.map(item => {
      try {
        const date = new Date(item.date);
        if (isValid(date)) {
          return format(date, 'MMM d');
        }
        return item.date;
      } catch {
        return item.date;
      }
    });

    // Return the chart data
    return {
      labels,
      datasets: [
        {
          label: 'Page Views',
          data: pageViewsData.map(item => item.count),
          fill: false,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgb(99, 102, 241)',
        },
      ],
    };
  }, [pageViewsData]);

  // Calculate total views
  const totalViews = useMemo(() => {
    return pageViewsData.reduce((sum, item) => sum + item.count, 0);
  }, [pageViewsData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(229, 231, 235)' // text-gray-200
        }
      },
      title: {
        display: true,
        text: 'Page Views',
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
          color: 'rgb(209, 213, 219)', // text-gray-300
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)' // gray-600 with opacity
        }
      }
    }
  };

  return (
    <div>
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

      <div className="h-full">
        {pageViewsData.length === 0 ? (
          <div className="h-64 flex items-center justify-center bg-gray-800 text-gray-400">
            No data available for the selected period
          </div>
        ) : (
          <div className="h-64">
            {chartType === 'line' ? (
              <Line data={chartData} options={options} />
            ) : (
              <Bar data={chartData} options={options} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}