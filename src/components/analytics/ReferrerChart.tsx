'use client';

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReferrerData {
  referrer: string;
  count: number;
}

// Accept analytics, isLoading, error as props instead of fetching internally
interface ReferrerChartProps {
  analytics?: { referrers?: ReferrerData[] };
  isLoading?: boolean;
  error?: string;
}

export default function ReferrerChart({ analytics, isLoading, error }: ReferrerChartProps) {
  const referrerData = analytics?.referrers || [];

  // Process data for chart - limit to top 5 referrers
  const processChartData = () => {
    if (referrerData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          backgroundColor: 'rgba(75, 85, 99, 0.5)', // gray-600 with opacity for dark theme
        }]
      };
    }
    
    // Sort by count and take top 5
    const sortedData = [...referrerData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      labels: sortedData.map(item => {
        const url = item.referrer || 'Direct';
        // Simplify URLs for display
        try {
          if (url !== 'Direct') {
            const urlObj = new URL(url);
            return urlObj.hostname;
          }
          return url;
        } catch {
          return url;
        }
      }),
      datasets: [{
        label: 'Referrers',
        data: sortedData.map(item => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.5)', // indigo with opacity
      }]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Referrers',
        color: 'rgb(229, 231, 235)' // text-gray-200 for dark theme
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: 'rgb(209, 213, 219)' // text-gray-300 for dark theme
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)' // gray-600 with opacity for dark theme
        }
      },
      x: {
        ticks: {
          color: 'rgb(209, 213, 219)' // text-gray-300 for dark theme
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)' // gray-600 with opacity for dark theme
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="card h-full">
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center bg-gray-800 text-red-400">{error}</div>;
  }

  return (
    <div className="card h-full">
      <div className="h-64">
        <Bar data={processChartData()} options={options} />
      </div>
    </div>
  );
}