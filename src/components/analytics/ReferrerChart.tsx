// components/analytics/ReferrerChart.tsx
'use client';

import { useEffect, useState } from 'react';
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

interface ReferrerChartProps {
  projectId: string;
}

export default function ReferrerChart({ projectId }: ReferrerChartProps) {
  const [referrerData, setReferrerData] = useState<ReferrerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/referrers`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch referrer data');
        }
        
        const data = await response.json();
        setReferrerData(data.referrers);
      } catch (err) {
        setError('Failed to load referrer data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Process data for chart - limit to top 5 referrers
  const processChartData = () => {
    if (referrerData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          backgroundColor: 'rgba(209, 213, 219, 0.5)',
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
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
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
    return <div className="h-64 flex items-center justify-center bg-gray-50">Loading referrer data...</div>;
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center bg-gray-50 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <div className="h-64">
        <Bar data={processChartData()} options={options} />
      </div>
    </div>
  );
}