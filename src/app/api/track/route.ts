import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Handle CORS
    const origin = request.headers.get('origin');
    
    // Create the response first
    const data = await request.json();
    const { page, referrer, projectApiKey, sessionId, userAgent } = data;

    // Validate API key
    const project = await prisma.project.findUnique({
      where: { apiKey: projectApiKey }
    });

    if (!project) {
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

    // Store the page view
    await prisma.pageView.create({
      data: {
        page,
        referrer: referrer || null,
        userAgent: userAgent || null,
        country: data.country || null,
        region: data.region || null,
        city: data.city || null,
        deviceType: data.deviceType || null,
        sessionId,
        projectId: project.id
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
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

// Add this to handle preflight OPTIONS requests
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