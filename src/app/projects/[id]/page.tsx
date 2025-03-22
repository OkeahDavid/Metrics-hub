// app/projects/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PageViewsChart from '@/components/analytics/PageViewsChart';
import DeviceTypeChart from '@/components/analytics/DeviceTypeChart';
import ReferrerChart from '@/components/analytics/ReferrerChart';
import TopPagesTable from '@/components/analytics/TopPagesTable';
import LiveVisitors from '@/components/analytics/LiveVisitors';
import CopyToClipboard from '@/components/ui/CopyToClipboard';
import ExportDataButton from '@/components/analytics/ExportDataButton';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProjectPage() {
  const params = useParams();
  const id = params.id;
  
  const [project, setProject] = useState<{ name: string; id: string; apiKey: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [error, setError] = useState('');

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id, fetchProject]);

  const handleCopySuccess = () => {
    toast.success('API key copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !project) {
    return <div className="text-center text-red-500">{error || 'Project not found'}</div>;
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{project.name} - Analytics</h2>
        <div className="flex space-x-3">
          <ExportDataButton projectId={project.id} projectName={project.name} />
          <div className="inline-flex rounded-md shadow-sm">
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 text-sm font-medium ${
                  timeRange === days
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${days === 7 ? 'rounded-l-md' : ''} ${days === 90 ? 'rounded-r-md' : ''}`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg text-black font-semibold">API Key</h3>
          <CopyToClipboard text={project.apiKey} onCopy={handleCopySuccess}>
            <button className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md">
              Copy to Clipboard
            </button>
          </CopyToClipboard>
        </div>
        <code className="block bg-gray-800 text-white p-3 rounded-md overflow-x-auto font-mono">
          {project.apiKey}
        </code>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Installation</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-700 mb-2">Add this script to your website:</p>
          <pre className="bg-gray-800 text-white p-3 rounded-md overflow-x-auto text-xs">
            {`<script>
  (function() {
    // Generate a session ID
    let sessionId = localStorage.getItem('metrics_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('metrics_session_id', sessionId);
    }
    
    // Send pageview data
    fetch('${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-metrics-hub.com'}/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectApiKey: '${project.apiKey}',
        page: window.location.pathname,
        referrer: document.referrer,
        sessionId: sessionId,
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      })
    }).catch(err => console.error('Analytics error:', err));
  })();
</script>`}
          </pre>
          <CopyToClipboard 
            text={`<script>
  (function() {
    // Generate a session ID
    let sessionId = localStorage.getItem('metrics_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('metrics_session_id', sessionId);
    }
    
    // Send pageview data
    fetch('${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-metrics-hub.com'}/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectApiKey: '${project.apiKey}',
        page: window.location.pathname,
        referrer: document.referrer,
        sessionId: sessionId,
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      })
    }).catch(err => console.error('Analytics error:', err));
  })();
</script>`} 
            onCopy={() => toast.success('Tracking script copied to clipboard!')}
          >
            <button className="mt-2 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md">
              Copy Script
            </button>
          </CopyToClipboard>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PageViewsChart projectId={project.id} days={timeRange} />
        </div>
        
        <div>
          <LiveVisitors projectId={project.id} />
        </div>
        
        <div>
          <DeviceTypeChart projectId={project.id} />
        </div>
        
        <div>
          <ReferrerChart projectId={project.id} />
        </div>
        
        <div className="lg:col-span-3">
          <TopPagesTable projectId={project.id} />
        </div>
      </div>
    </div>
  );
}