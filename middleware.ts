import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME, ACCESS_JWT_HEADER, verifyAdmin } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

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
    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
