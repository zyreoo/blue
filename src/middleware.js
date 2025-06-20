import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname;

  // If it's the profile page or any protected route
  if (path.startsWith('/profile')) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If not authenticated, redirect to sign-in page
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000');
  
  if (path.startsWith('/_next/static/') || path.startsWith('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  if (path.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 