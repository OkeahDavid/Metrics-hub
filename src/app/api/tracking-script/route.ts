import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('apiKey');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  // Verify the API key is valid
  const project = await prisma.project.findUnique({
    where: { apiKey },
  });

  if (!project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Create the tracking script
  const trackingScript = `
    (function() {
      // Generate a random session ID if none exists
      let sessionId = localStorage.getItem('metrics_hub_session_id');
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('metrics_hub_session_id', sessionId);
      }
      
      // Basic device detection
      function getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
          return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
          return 'mobile';
        }
        return 'desktop';
      }
      
      // Send analytics data
      fetch('${url.origin}/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          deviceType: getDeviceType(),
          country: null, // We're not collecting location data for privacy
          projectApiKey: '${apiKey}',
          sessionId: sessionId
        }),
        // Use keepalive to ensure the request completes even if page navigates away
        keepalive: true
      }).catch(console.error);
      
      // Track page navigation for SPAs
      let lastPage = window.location.pathname;
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function() {
        originalPushState.apply(this, arguments);
        if (lastPage !== window.location.pathname) {
          lastPage = window.location.pathname;
          trackPageView();
        }
      };
      
      history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        if (lastPage !== window.location.pathname) {
          lastPage = window.location.pathname;
          trackPageView();
        }
      };
      
      window.addEventListener('popstate', function() {
        if (lastPage !== window.location.pathname) {
          lastPage = window.location.pathname;
          trackPageView();
        }
      });
      
      function trackPageView() {
        fetch('${url.origin}/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            deviceType: getDeviceType(),
            country: null,
            projectApiKey: '${apiKey}',
            sessionId: sessionId
          }),
          keepalive: true
        }).catch(console.error);
      }
    })();
  `;

  return new NextResponse(trackingScript, {
    headers: { 'Content-Type': 'application/javascript' }
  });
}