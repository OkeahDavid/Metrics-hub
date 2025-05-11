'use client';

import { useState } from 'react';
import { subDays } from 'date-fns';

interface DateRangeSelectorProps {
  onChange: (dateRange: { from: Date; to: Date }) => void;
  isLoading?: boolean;
}

type PresetRange = '7d' | '14d' | '30d' | '90d' | 'all';

export default function DateRangeSelector({
  onChange,
  isLoading = false
}: DateRangeSelectorProps) {
  const [activePreset, setActivePreset] = useState<PresetRange>('7d');

  const handlePresetClick = (preset: PresetRange) => {
    // Don't process if already loading or if it's the same preset
    if (isLoading || preset === activePreset) return;

    const now = new Date();
    let from: Date;
    
    switch (preset) {
      case '7d':
        from = subDays(now, 6); // 7 days including today
        break;
      case '14d':
        from = subDays(now, 13); // 14 days including today
        break;
      case '30d':
        from = subDays(now, 29); // 30 days including today
        break;
      case '90d':
        from = subDays(now, 89); // 90 days including today
        break;
      case 'all':
        from = new Date(0); // Epoch time (Jan 1, 1970)
        break;
      default:
        from = subDays(now, 6); // Default to 7 days
    }

    setActivePreset(preset);
    onChange({ from, to: now });
  };

  const getButtonClass = (preset: PresetRange) => {
    return `px-3 py-2 text-sm font-medium rounded-md ${
      activePreset === preset
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} transition-colors duration-150`;
  };

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
      <span className="text-sm text-gray-400 mr-2">Date Range:</span>
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={getButtonClass('7d')}
          onClick={() => handlePresetClick('7d')}
          disabled={isLoading}
        >
          7 Days
        </button>
        <button
          type="button"
          className={getButtonClass('14d')}
          onClick={() => handlePresetClick('14d')}
          disabled={isLoading}
        >
          14 Days
        </button>
        <button
          type="button"
          className={getButtonClass('30d')}
          onClick={() => handlePresetClick('30d')}
          disabled={isLoading}
        >
          30 Days
        </button>
        <button
          type="button"
          className={getButtonClass('90d')}
          onClick={() => handlePresetClick('90d')}
          disabled={isLoading}
        >
          90 Days
        </button>
        <button
          type="button"
          className={getButtonClass('all')}
          onClick={() => handlePresetClick('all')}
          disabled={isLoading}
        >
          All Time
        </button>
      </div>
      {isLoading && (
        <span className="text-sm text-gray-400 animate-pulse ml-2">Loading...</span>
      )}
    </div>
  );
}