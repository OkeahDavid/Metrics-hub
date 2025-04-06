import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Admin path patterns
  const isAdminPath = path.startsWith('/admin') || 
                      path.includes('/api/users/') && path.includes('/toggle-superuser');
  
  if (isAdminPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Check if user is authenticated and is a superuser
    if (!token || !token.isSuperUser) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/users/:path*/toggle-superuser'
  ],
};