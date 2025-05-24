"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PageViewsChart from '@/components/analytics/PageViewsChart';
import DeviceTypeChart from '@/components/analytics/DeviceTypeChart';
import ReferrerChart from '@/components/analytics/ReferrerChart';
import TopPagesTable from '@/components/analytics/TopPagesTable';
import LiveVisitors from '@/components/analytics/LiveVisitors';
import TopCountriesChart from '@/components/analytics/TopCountriesChart';
import DateRangeSelector from '@/components/analytics/DateRangeSelector';
import CopyToClipboard from '@/components/ui/CopyToClipboard';
import ExportDataButton from '@/components/analytics/ExportDataButton';
import { ToastContainer, toast } from 'react-toastify';
import { useProjectAnalytics } from '@/lib/hooks/useProjectAnalytics';
import 'react-toastify/dist/ReactToastify.css';

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [project, setProject] = useState<{ name: string; id: string; apiKey: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInstallation, setShowInstallation] = useState(false);
  
  // Use our improved analytics hook
  const { analytics, isLoading, setDateRange } = useProjectAnalytics(id);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      // Update to work with the new standardized API response format
      setProject(data.success ? data.data : data.project);
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
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-100">{project.name} - Analytics</h2>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowInstallation(!showInstallation)}
            className="px-3 py-2 text-gray-100 text-sm bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600"
          >
            {showInstallation ? 'Hide Setup' : 'Setup Instructions'}
          </button>
          <ExportDataButton projectId={project.id} projectName={project.name} />
        </div>
      </div>
      
      {/* Date range selector */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
        <DateRangeSelector 
          onChange={setDateRange} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Installation section - now collapsible */}
      {showInstallation && (
        <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg text-gray-100 font-medium">Installation Instructions</h3>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300">Step 1: Copy your API Key</h4>
                <CopyToClipboard text={project.apiKey} onCopy={handleCopySuccess}>
                  <button className="px-3 py-1 text-xs text-indigo-400 hover:bg-gray-700 rounded-md">
                    Copy Key
                  </button>
                </CopyToClipboard>
              </div>
              <code className="block bg-gray-900 text-gray-100 p-2 rounded-md overflow-x-auto text-sm font-mono">
                {project.apiKey}
              </code>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Step 2: Choose your tracking method</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Option 1: JavaScript Tracking */}
                <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                  <h5 className="text-sm font-bold text-gray-200 mb-2">Option 1: JavaScript Tracking</h5>
                  <p className="text-xs text-gray-400 mb-2">
                    Comprehensive tracking with full browser information. Requires JavaScript to be enabled.
                  </p>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto text-xs mb-2 max-h-48 overflow-y-auto">
                    {`<script>
(function() {
  // Generate a session ID
  let sessionId = localStorage.getItem('metrics_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('metrics_session_id', sessionId);
  }
  
  // Better device detection
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|webOS/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  // Get country information
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      // Send pageview data with location info
      fetch('https://metrics-hub.netlify.app/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectApiKey: '${project.apiKey}',
          page: window.location.pathname,
          referrer: document.referrer,
          sessionId: sessionId,
          userAgent: navigator.userAgent,
          deviceType: getDeviceType(),
          country: data.country_name,
          region: data.region,
          city: data.city
        }),
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    })
    .catch(err => {
      // Fall back to sending data without location info
      console.error('Country detection error:', err);
      fetch('https://metrics-hub.netlify.app/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectApiKey: '${project.apiKey}',
          page: window.location.pathname,
          referrer: document.referrer,
          sessionId: sessionId,
          userAgent: navigator.userAgent,
          deviceType: getDeviceType()
        }),
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    });
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
  
  // Better device detection
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|webOS/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  // Get country information
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      // Send pageview data with location info
      fetch('https://metrics-hub.netlify.app/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectApiKey: '${project.apiKey}',
          page: window.location.pathname,
          referrer: document.referrer,
          sessionId: sessionId,
          userAgent: navigator.userAgent,
          deviceType: getDeviceType(),
          country: data.country_name,
          region: data.region,
          city: data.city
        }),
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    })
    .catch(err => {
      // Fall back to sending data without location info
      console.error('Country detection error:', err);
      fetch('https://metrics-hub.netlify.app/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectApiKey: '${project.apiKey}',
          page: window.location.pathname,
          referrer: document.referrer,
          sessionId: sessionId,
          userAgent: navigator.userAgent,
          deviceType: getDeviceType()
        }),
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    });
})();
</script>`} 
                    onCopy={() => toast.success('JavaScript tracking code copied to clipboard!')}
                  >
                    <button className="px-3 py-1 text-xs text-indigo-400 hover:bg-gray-700 rounded-md">
                      Copy Script
                    </button>
                  </CopyToClipboard>
                </div>
                
                {/* Option 2: API-based Tracking */}
                <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                  <h5 className="text-sm font-bold text-gray-200 mb-2">Option 2: Direct API Tracking</h5>
                  <p className="text-xs text-gray-400 mb-2">
                    Simplified tracking that works without JavaScript. Ideal for server-side rendering or minimal tracking.
                  </p>
                  
                  <div className="mb-3">
                    <h6 className="text-xs font-medium text-gray-300 mb-1">HTML Image Pixel</h6>
                    <pre className="bg-gray-800 text-gray-100 p-2 rounded-md overflow-x-auto text-xs">
                      {`<img src="https://metrics-hub.netlify.app/api/track?key=${project.apiKey}&p=/current-page" width="1" height="1" alt="" style="display:none" />`}
                    </pre>
                    <CopyToClipboard 
                      text={`<img src="https://metrics-hub.netlify.app/api/track?key=${project.apiKey}&p=/current-page" width="1" height="1" alt="" style="display:none" />`}
                      onCopy={() => toast.success('Image pixel code copied to clipboard!')}
                    >
                      <button className="mt-1 px-2 py-1 text-xs text-indigo-400 hover:bg-gray-700 rounded-md">
                        Copy Pixel Code
                      </button>
                    </CopyToClipboard>
                  </div>
                  
                  <div>
                    <h6 className="text-xs font-medium text-gray-300 mb-1">Server-side Integration</h6>
                    <pre className="bg-gray-800 text-gray-100 p-2 rounded-md overflow-x-auto text-xs">
                      {`// Node.js server-side example
fetch("https://metrics-hub.netlify.app/api/track?key=${project.apiKey}&p=/current-page&r=referrer-url", { method: "GET" });`}
                    </pre>
                    <CopyToClipboard 
                      text={`// Node.js server-side example
fetch("https://metrics-hub.netlify.app/api/track?key=${project.apiKey}&p=/current-page&r=referrer-url", { method: "GET" });`}
                      onCopy={() => toast.success('Server-side code copied to clipboard!')}
                    >
                      <button className="mt-1 px-2 py-1 text-xs text-indigo-400 hover:bg-gray-700 rounded-md">
                        Copy Server Code
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-900 rounded-md p-4 border border-gray-700">
                <h5 className="text-sm font-bold text-gray-200 mb-2">API Parameters</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="p-2 text-left text-gray-300">Parameter</th>
                        <th className="p-2 text-left text-gray-300">Short Form</th>
                        <th className="p-2 text-left text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-t border-gray-700 text-gray-200">key</td>
                        <td className="p-2 border-t border-gray-700 text-gray-200">-</td>
                        <td className="p-2 border-t border-gray-700 text-gray-400">Your project API key (required)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t border-gray-700 text-gray-200">page</td>
                        <td className="p-2 border-t border-gray-700 text-gray-200">p</td>
                        <td className="p-2 border-t border-gray-700 text-gray-400">The page path being tracked</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t border-gray-700 text-gray-200">referrer</td>
                        <td className="p-2 border-t border-gray-700 text-gray-200">r, ref</td>
                        <td className="p-2 border-t border-gray-700 text-gray-400">The referrer URL</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t border-gray-700 text-gray-200">sessionId</td>
                        <td className="p-2 border-t border-gray-700 text-gray-200">sid</td>
                        <td className="p-2 border-t border-gray-700 text-gray-400">Session identifier (optional)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t border-gray-700 text-gray-200">deviceType</td>
                        <td className="p-2 border-t border-gray-700 text-gray-200">dt</td>
                        <td className="p-2 border-t border-gray-700 text-gray-400">Device type: mobile, tablet, desktop</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-t border-gray-700 text-gray-200">country</td>
                        <td className="p-2 border-t border-gray-700 text-gray-200">c</td>
                        <td className="p-2 border-t border-gray-700 text-gray-400">Country name</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main analytics dashboard */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isLoading ? 'opacity-70' : ''}`}>
        <div className="lg:col-span-2">
          <div className="card h-full">
            <h3 className="text-lg text-gray-100 font-medium mb-4">Page Views</h3>
            {analytics.isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-full h-32 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : analytics.error ? (
              <div className="h-64 flex items-center justify-center bg-gray-800 text-red-400">
                {String(analytics.error)}
              </div>
            ) : (
              <div className="h-64">
                {analytics.data?.pageViews && (
                  <PageViewsChart 
                    pageViewsData={analytics.data.pageViews} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <LiveVisitors projectId={project.id} />
        </div>
        
        <div>
          <DeviceTypeChart analytics={analytics.data} isLoading={analytics.isLoading} error={analytics.error ? String(analytics.error) : undefined} />
        </div>
        
        <div>
          <ReferrerChart analytics={analytics.data} isLoading={analytics.isLoading} error={analytics.error ? String(analytics.error) : undefined} />
        </div>
        
        <div>
          <TopCountriesChart analytics={analytics.data} isLoading={analytics.isLoading} error={analytics.error ? String(analytics.error) : undefined} />
        </div>
        
        <div className="lg:col-span-3">
          <TopPagesTable analytics={analytics.data} isLoading={analytics.isLoading} error={analytics.error ? String(analytics.error) : undefined} />
        </div>
      </div>
    </div>
  );
}