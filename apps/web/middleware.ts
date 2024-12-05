import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { middleware as securityHeaders } from './security/headers';
import { getRateLimitMiddleware } from './security/rate-limit';

const rateLimitMiddleware = getRateLimitMiddleware();

export async function middleware(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }

  // Apply security headers
  return securityHeaders(request);
}

// Configure paths that require security middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/health-check (health check endpoints)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api/health-check|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
};
