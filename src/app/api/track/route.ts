import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { handleApiError } from '@/lib/error-handler';

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