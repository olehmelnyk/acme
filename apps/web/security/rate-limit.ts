import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { LRUCache } from 'lru-cache';

// Define rate limit options
const rateLimit = {
  window: 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per window
};

// Create a cache instance
const tokenCache = new LRUCache({
  max: 500,
  ttl: rateLimit.window
});

export function getRateLimitMiddleware() {
  return async function rateLimitMiddleware(request: NextRequest) {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous';
    const tokenCount = (tokenCache.get(ip) as number[]) || [0];
    const currentTime = Date.now();
    const windowStart = currentTime - rateLimit.window;

    // Filter out old requests and count recent ones
    tokenCount[0] = tokenCount.filter((timestamp: number) => timestamp > windowStart).length;

    // Check if rate limit is exceeded
    if (tokenCount[0] >= rateLimit.max) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'Retry-After': `${Math.ceil(rateLimit.window / 1000)}`,
          'X-RateLimit-Limit': `${rateLimit.max}`,
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': `${Math.ceil((windowStart + rateLimit.window) / 1000)}`
        }
      });
    }

    // Add current request timestamp
    tokenCount.push(currentTime);
    tokenCache.set(ip, tokenCount);

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', `${rateLimit.max}`);
    response.headers.set('X-RateLimit-Remaining', `${rateLimit.max - tokenCount[0]}`);
    response.headers.set('X-RateLimit-Reset', `${Math.ceil((windowStart + rateLimit.window) / 1000)}`);

    return response;
  };
}
