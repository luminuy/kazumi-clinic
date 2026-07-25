import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME, ACCESS_JWT_HEADER, verifyAdmin } from '@/lib/auth';
import { CSRF_COOKIE_NAME } from '@/lib/csrf';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Issues the double-submit CSRF cookie for /api/checkout if this visitor doesn't have one yet. */
function ensureCsrfCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(CSRF_COOKIE_NAME)) return;
  response.cookies.set(CSRF_COOKIE_NAME, crypto.randomUUID(), {
    httpOnly: false, // client JS must read this — see lib/csrf.ts
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h — long enough to cover an abandoned-then-resumed checkout
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const jwt =
      request.headers.get(ACCESS_JWT_HEADER) ?? request.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
    const admin = await verifyAdmin(jwt);
    if (!admin) return new NextResponse(null, { status: 404 });

    const headers = new Headers(request.headers);
    headers.set('x-admin-email', admin.email);
    return NextResponse.next({ request: { headers } });
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Strict trailing slash removal for SEO (prevents duplicate content)
  // Must be done before next-intl processes the URL
  if (pathname !== '/' && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    const response = NextResponse.redirect(url, 308);
    ensureCsrfCookie(request, response);
    return response;
  }

  const response = intlMiddleware(request);
  ensureCsrfCookie(request, response);
  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
