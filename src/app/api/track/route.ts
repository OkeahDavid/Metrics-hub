import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Handle CORS
    const origin = request.headers.get('origin');
    
    // Create the response first
    const data = await request.json();
    console.log("Received tracking data:", data); // Debug log
    
    const { page, referrer, projectApiKey, sessionId, userAgent, deviceType } = data;

    // Validate API key
    const project = await prisma.project.findUnique({
      where: { apiKey: projectApiKey }
    });

    if (!project) {
      console.log("Invalid API key:", projectApiKey);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }

    // Normalize device type
    let normalizedDeviceType = deviceType;
    if (!normalizedDeviceType || !['mobile', 'tablet', 'desktop'].includes(normalizedDeviceType)) {
      // Fallback detection if client-side detection failed
      if (userAgent && /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
          normalizedDeviceType = 'tablet';
        } else {
          normalizedDeviceType = 'mobile';
        }
      } else {
        normalizedDeviceType = 'desktop';
      }
    }
    
    console.log(`Storing pageview with device type: ${normalizedDeviceType} for project ${project.id}`);

    // Store the page view
    const pageView = await prisma.pageView.create({
      data: {
        page,
        referrer: referrer || null,
        userAgent: userAgent || null,
        country: data.country || null,
        region: data.region || null,
        city: data.city || null,
        deviceType: normalizedDeviceType,
        sessionId,
        projectId: project.id
      }
    });
    
    console.log("Created pageView:", pageView.id);

    return new NextResponse(
      JSON.stringify({ success: true, pageViewId: pageView.id }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to track analytics' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  });
}