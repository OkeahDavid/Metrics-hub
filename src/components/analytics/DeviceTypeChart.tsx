'use client';

import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DeviceData {
  deviceType: string;
  count: number;
}

interface DeviceTypeChartProps {
  analytics?: { deviceTypes?: DeviceData[] };
  isLoading?: boolean;
  error?: string;
}

export default function DeviceTypeChart({ analytics }: DeviceTypeChartProps) {
  const deviceData = analytics?.deviceTypes || [];

  // Default data if no visits yet
  const getChartData = () => {
    if (!deviceData || deviceData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#4b5563'], // gray-600 for dark theme
            borderWidth: 0,
          },
        ],
      };
    }

    // Fixed color per device type, so a type keeps its color regardless of
    // which other types are present in this project's data.
    const deviceColors: Record<string, string> = {
      desktop: 'rgba(99, 102, 241, 0.7)',  // Indigo
      mobile: 'rgba(16, 185, 129, 0.7)',   // Green
      tablet: 'rgba(245, 158, 11, 0.7)',   // Amber
    };

    // Only include device types that actually have visits, so the legend
    // doesn't list a type (e.g. tablet) with a count of zero.
    const present = deviceData.filter(item => item.deviceType in deviceColors && item.count > 0);

    return {
      labels: present.map(item => item.deviceType),
      datasets: [
        {
          data: present.map(item => item.count),
          backgroundColor: present.map(item => deviceColors[item.deviceType]),
          borderWidth: 1,
          borderColor: '#374151', // gray-700 for dark theme border
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(209, 213, 219)' // text-gray-300 for dark theme
        }
      },
      title: {
        display: true,
        text: 'Device Types',
        color: 'rgb(229, 231, 235)' // text-gray-200 for dark theme
      },
    },
  };
  // Loading and error states are now handled by the parent component

  return (
    <div className="card h-full">
      <div className="h-64 flex items-center justify-center">
        <Pie data={getChartData()} options={options} />
      </div>
      <div className="mt-2 text-xs text-gray-400 text-center">
        {deviceData.map(item => (
          <div key={item.deviceType}>{item.deviceType}: {item.count}</div>
        ))}
      </div>
    </div>
  );
}