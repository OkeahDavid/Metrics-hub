import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { handleApiError } from '@/lib/error-handler';
import { v4 as uuidv4 } from 'uuid';

// Define a proper type for the tracking data
interface TrackingData {
  page: string;
  referrer?: string;
  projectApiKey: string;
  sessionId: string;
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  country?: string;
  region?: string;
  city?: string;
}

// New GET endpoint for simplified API-based tracking
export async function GET(request: NextRequest) {
  try {
    // Handle CORS
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent') || null;
    
    // Parse parameters from query string
    const { searchParams } = new URL(request.url);
    const projectApiKey = searchParams.get('key');
    const page = searchParams.get('p') || searchParams.get('page') || '/';
    const sessionId = searchParams.get('sid') || searchParams.get('sessionId') || uuidv4();
    const referrer = searchParams.get('r') || searchParams.get('ref') || searchParams.get('referrer') || referer || null;
    const deviceType = searchParams.get('dt') || searchParams.get('deviceType');
    const country = searchParams.get('c') || searchParams.get('country');
    const region = searchParams.get('region');
    const city = searchParams.get('city');
    
    // Validate required parameters
    if (!projectApiKey) {
      return handleImageResponse(origin, 400);
    }

    // Validate API key
    const project = await prisma.project.findUnique({
      where: { apiKey: projectApiKey }
    });

    if (!project) {
      return handleImageResponse(origin, 401);
    }

    // Normalize device type (passing undefined instead of null for deviceType)
    const normalizedDeviceType = normalizeDeviceType(
      deviceType || undefined, 
      userAgent || undefined
    );
    
    // Store the page view
    await prisma.pageView.create({
      data: {
        page,
        referrer,
        userAgent,
        country,
        region,
        city,
        deviceType: normalizedDeviceType,
        sessionId,
        projectId: project.id
      }
    });

    // Return a transparent 1x1 pixel GIF
    return handleImageResponse(origin, 200);
  } catch (error: unknown) {
    console.error('Tracking error:', error);
    return handleImageResponse(null, 500);
  }
}

// Helper function to return a 1x1 transparent GIF with appropriate headers
function handleImageResponse(origin: string | null, status: number): NextResponse {
  // 1x1 transparent GIF
  const TRANSPARENT_GIF_PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  
  return new NextResponse(TRANSPARENT_GIF_PIXEL, {
    status,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Access-Control-Allow-Origin': origin || '*'
    }
  });
}

export async function POST(request: Request) {
  try {
    // Handle CORS
    const origin = request.headers.get('origin');
    
    // Parse and validate request data with proper typing
    const data = await request.json() as TrackingData;
    
    const { page, referrer, projectApiKey, sessionId, userAgent, deviceType } = data;

    if (!page || !projectApiKey || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { 
          status: 400,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // Validate API key
    const project = await prisma.project.findUnique({
      where: { apiKey: projectApiKey }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { 
          status: 401,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // Normalize device type
    const normalizedDeviceType = normalizeDeviceType(deviceType, userAgent);
    
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

    return NextResponse.json(
      { success: true, pageViewId: pageView.id },
      { 
        status: 200,
        headers: getCorsHeaders(origin)
      }
    );
  } catch (error) {
    // Using our standardized error handler
    const errorResponse = handleApiError(error, 'Failed to track analytics');
    
    // Add CORS headers to the error response
    const origin = request.headers.get('origin');
    const headers = errorResponse.headers;
    const corsHeaders = getCorsHeaders(origin);
    
    Object.keys(corsHeaders).forEach(key => {
      headers.append(key, corsHeaders[key]);
    });
    
    return errorResponse;
  }
}

// Helper function to normalize device type
function normalizeDeviceType(deviceType?: string, userAgent?: string): 'mobile' | 'tablet' | 'desktop' {
  if (deviceType && ['mobile', 'tablet', 'desktop'].includes(deviceType)) {
    return deviceType as 'mobile' | 'tablet' | 'desktop';
  }
  
  // Fallback detection if client-side detection failed
  if (userAgent) {
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
        return 'tablet';
      }
      return 'mobile';
    }
  }
  
  return 'desktop';
}

// Helper function for CORS headers
function getCorsHeaders(origin: string | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin)
  });
}