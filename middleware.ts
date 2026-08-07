import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for presence of Supabase authentication token inside cookies.
  // Our custom client-side cookie storage writes it as "sb-XXXX-auth-token"
  const allCookies = request.cookies.getAll();
  const hasSession = allCookies.some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  );

  const { pathname } = request.nextUrl;

  // Protect /dashboard, /profile, /provider, and /categories routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/provider') || pathname.startsWith('/categories')) {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      // Pass redirect param so they can be routed back after logging in
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*',
    '/provider/:path*',
    '/categories/:path*'
  ],
};
