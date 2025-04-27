'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

interface ExportDataButtonProps {
  projectId: string;
  projectName: string;
}

export default function ExportDataButton({ projectId, projectName }: ExportDataButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      setShowOptions(false);
      
      const response = await fetch(`/api/projects/${projectId}/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error(`Failed to export data: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const filename = `metrics_hub_${projectName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      saveAs(blob, filename);
      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className="btn-primary inline-flex items-center"
      >
        {isExporting ? 'Exporting...' : 'Export Data'}
      </button>
      
      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleExport('csv')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}