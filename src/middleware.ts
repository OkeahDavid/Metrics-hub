import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
// In production, you would use Redis or another distributed store
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Apply rate limiting for authentication routes
  if (path.includes('/api/auth') && request.method !== 'OPTIONS') {
    const response = applyRateLimit(request);
    if (response) {
      return response;
    }
  }
  
  // Admin path patterns that require superuser
  const isSuperUserPath = path.startsWith('/admin') || 
                        path.includes('/api/users/') && path.includes('/toggle-superuser');
  
  // Project management paths that require authorization
  const isProjectManagementPath = path.startsWith('/api/projects') && 
                               (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE');

  if (isSuperUserPath || isProjectManagementPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // For superuser paths, verify the user is a superuser
    if (isSuperUserPath && !token.isSuperUser) {
      return NextResponse.json(
        { error: 'Access denied. Requires superuser privileges.' },
        { status: 403 }
      );
    }

    // For project management, the session check is enough
    // Additional authorization checks will be handled in the API route
  }

  return NextResponse.next();
}

// Helper function to apply rate limiting
function applyRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  
  // Initialize or reset if window expired
  if (!rateLimitStore[ip] || rateLimitStore[ip].resetTime < now) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    };
    return null;
  }
  
  // Increment request count
  rateLimitStore[ip].count++;
  
  // Check if rate limit exceeded
  if (rateLimitStore[ip].count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      }
    );
  }
  
  return null;
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/users/:path*/toggle-superuser',
    '/api/projects/:path*',
    '/api/auth/:path*'
  ],
};