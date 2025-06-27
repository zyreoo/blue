import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/profile')) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

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

  if (path.startsWith('/api/auth/') || path.includes('auth')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  else if (path.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, must-revalidate, proxy-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 