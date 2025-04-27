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

interface CountryData {
  country: string;
  count: number;
}

interface TopCountriesChartProps {
  projectId: string;
}

export default function TopCountriesChart({ projectId }: TopCountriesChartProps) {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/countries`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch country data');
        }
        
        const data = await response.json();
        // Handle both the new standardized format and the old format
        const countries = data.success ? data.data : data.countries;
        setCountryData(countries);
      } catch (err) {
        setError('Failed to load country data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Default data if no visits yet
  const getChartData = () => {
    if (countryData.length === 0) {
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

    // Extended color palette with distinct colors for better visual separation
    const colorPalette = [
      'rgba(99, 102, 241, 0.8)',    // Indigo
      'rgba(16, 185, 129, 0.8)',    // Green
      'rgba(245, 158, 11, 0.8)',    // Amber
      'rgba(239, 68, 68, 0.8)',     // Red
      'rgba(14, 165, 233, 0.8)',    // Sky blue
      'rgba(168, 85, 247, 0.8)',    // Purple
      'rgba(236, 72, 153, 0.8)',    // Pink
      'rgba(234, 88, 12, 0.8)',     // Orange
      'rgba(22, 163, 74, 0.8)',     // Green
      'rgba(79, 70, 229, 0.8)',     // Violet
      'rgba(190, 24, 93, 0.8)',     // Rose
      'rgba(132, 204, 22, 0.8)',    // Lime
      'rgba(6, 182, 212, 0.8)',     // Cyan
      'rgba(249, 115, 22, 0.8)',    // Orange
      'rgba(202, 138, 4, 0.8)'      // Amber dark
    ];

    // Ensure we have enough colors by cycling through the palette if needed
    const backgroundColors = countryData.map((_, index) => 
      colorPalette[index % colorPalette.length]
    );

    return {
      labels: countryData.map(item => item.country),
      datasets: [
        {
          data: countryData.map(item => item.count),
          backgroundColor: backgroundColors,
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
        text: 'Top Countries',
      },
    },
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center bg-gray-50">Loading country data...</div>;
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