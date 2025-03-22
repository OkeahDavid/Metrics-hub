// app/projects/[id]/page.tsx
import prisma from '@/lib/db';
import PageViewsChart from '@/components/analytics/PageViewsChart';
import DeviceTypeChart from '@/components/analytics/DeviceTypeChart';

interface ProjectPageParams {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageParams) {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
  
    const project = await prisma.project.findUnique({
      where: { id },
    });
    
  if (!project) {
    return <div className="text-center text-red-500">Project not found</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">{project.name} - Analytics</h2>
      
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <PageViewsChart projectId={project.id} />
        </div>
        
        <div>
          <DeviceTypeChart projectId={project.id} />
        </div>
        
        {/* Add more charts/stats as desired */}
      </div>
    </div>
  );
}