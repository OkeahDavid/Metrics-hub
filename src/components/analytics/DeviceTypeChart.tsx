'use client';

import { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface DeviceData {
  deviceType: string;
  count: number;
}

interface DeviceTypeChartProps {
  projectId: string;
}

export default function DeviceTypeChart({ projectId }: DeviceTypeChartProps) {
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/device-types`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch device data');
        }
        
        const data = await response.json();
        setDeviceData(data.deviceTypes);
      } catch (err) {
        setError('Failed to load device data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Default data if no visits yet
  const getChartData = () => {
    if (deviceData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels: deviceData.map(item => item.deviceType || 'Unknown'),
      datasets: [
        {
          data: deviceData.map(item => item.count),
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',  // Indigo
            'rgba(79, 70, 229, 0.7)',   // Purple
            'rgba(16, 185, 129, 0.7)',  // Green
            'rgba(245, 158, 11, 0.7)',  // Amber
          ],
          borderWidth: 1,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Device Types',
      },
    },
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center bg-gray-50">Loading device data...</div>;
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center bg-gray-50 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <div className="h-64 flex items-center justify-center">
        <Pie data={getChartData()} options={options} />
      </div>
    </div>
  );
}