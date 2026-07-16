import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_JWT_HEADER, verifyAdmin } from '@/lib/auth';

/**
 * The only gate on /admin. It runs before the route is resolved, so it covers the pages and the
 * route handlers alike — an auth check inside a layout would leave /api/admin/* wide open.
 *
 * Rejects with 404 rather than 401: an unauthenticated stranger shouldn't even learn that an
 * admin exists here, and robots.ts already disallows /admin (CLAUDE.md §5). Route handlers still
 * re-check with `verifyAdmin` themselves — this middleware is the lock, not the only lock.
 *
 * NOTE: no `export const runtime = 'edge'` — @opennextjs/cloudflare runs middleware in the same
 * nodejs_compat Worker as everything else (CLAUDE.md §0.4.2).
 */
export async function middleware(request: NextRequest) {
  const admin = await verifyAdmin(request.headers.get(ACCESS_JWT_HEADER));
  if (!admin) return new NextResponse(null, { status: 404 });

  // Hand the verified identity down so pages/handlers don't each re-verify the JWT.
  const headers = new Headers(request.headers);
  headers.set('x-admin-email', admin.email);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
