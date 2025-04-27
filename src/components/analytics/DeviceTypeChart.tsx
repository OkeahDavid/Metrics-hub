'use client';

import { useEffect, useState } from 'react';
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
        // Add cache busting parameter
        const response = await fetch(`/api/projects/${projectId}/device-types?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch device data');
        }
        
        const data = await response.json();
        console.log('Device data response:', data);
        
        // Handle both the new standardized format and the old format
        const deviceTypes = data.success ? data.data : data.deviceTypes;
        
        if (deviceTypes && Array.isArray(deviceTypes)) {
          setDeviceData(deviceTypes);
        } else {
          console.error('Invalid device data format:', data);
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching device data:', err);
        setError('Failed to load device data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh more frequently during testing
    const intervalId = setInterval(fetchData, 15000); // Update every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [projectId]);

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

    // Create a map of device types for more reliable data
    const deviceMap = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };
    
    // Fill the map with actual data
    deviceData.forEach(item => {
      if (item.deviceType && ['desktop', 'mobile', 'tablet'].includes(item.deviceType)) {
        if (item.deviceType in deviceMap) {
          deviceMap[item.deviceType as keyof typeof deviceMap] = item.count;
        }
      }
    });
    
    console.log('Processed device map:', deviceMap);
    
    // Create chart data from the map
    return {
      labels: Object.keys(deviceMap),
      datasets: [
        {
          data: Object.values(deviceMap),
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',  // Indigo (desktop)
            'rgba(16, 185, 129, 0.7)',  // Green (mobile)
            'rgba(245, 158, 11, 0.7)',  // Amber (tablet)
          ],
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

  if (isLoading) {
    return (
      <div className="card h-full">
        <div className="h-64 flex items-center justify-center">
          <div className="h-40 w-40 rounded-full bg-gray-700 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center bg-gray-800 text-red-400">{error}</div>;
  }

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