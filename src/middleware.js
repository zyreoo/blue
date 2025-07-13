import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Get the token
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('Middleware: Path accessed:', path);
  console.log('Middleware: Session:', session);

  // Protect profile routes
  if (path.startsWith('/profile')) {
    if (!session) {
      console.log('Middleware: No session, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protect superadmin routes
  if (path.startsWith('/superadmin')) {
    console.log('Middleware: Superadmin route accessed');
    if (!session) {
      console.log('Middleware: No session for superadmin route, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // Check if the user is a superadmin
    console.log('Middleware: Checking superadmin status:', session.isSuperAdmin);
    if (!session.isSuperAdmin) {
      console.log('Middleware: User is not superadmin, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log('Middleware: Superadmin access granted');
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