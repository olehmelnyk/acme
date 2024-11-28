# Performance Optimization Guide

## Frontend Optimization

### 1. Bundle Size Optimization

```typescript
// Next.js dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// Bundle analyzer configuration
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});
```

### 2. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['assets.example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

// Usage
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <Image
      src="/large-image.jpg"
      alt="Description"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      priority={true}
    />
  );
}
```

### 3. React Component Optimization

```typescript
// Memoization example
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});

// useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [/* dependencies */]);

// useMemo for expensive computations
const expensiveValue = useMemo(() => {
  return someExpensiveCalculation(props.data);
}, [props.data]);
```

## Backend Optimization

### 1. Database Query Optimization

```typescript
// Prisma query optimization
const users = await prisma.user.findMany({
  // Select only needed fields
  select: {
    id: true,
    name: true,
    email: true,
  },
  // Use cursor-based pagination
  take: 10,
  skip: 1,
  cursor: {
    id: lastId,
  },
  // Include relations only when needed
  include: {
    posts: {
      select: {
        id: true,
        title: true,
      },
    },
  },
});

// Raw SQL optimization
const result = await prisma.$queryRaw`
  SELECT 
    u.id,
    u.name,
    COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.id, u.name
  HAVING COUNT(p.id) > 0
`;
```

### 2. Caching Strategy

```typescript
// Redis caching implementation
import { redis } from '~/lib/redis';

export class CacheManager {
  constructor(
    private prefix: string,
    private ttl: number = 3600
  ) {}

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(this.getKey(key));
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await redis.set(
      this.getKey(key),
      JSON.stringify(value),
      'EX',
      this.ttl
    );
  }

  async invalidate(key: string): Promise<void> {
    await redis.del(this.getKey(key));
  }
}

// Usage
const userCache = new CacheManager('users', 1800);

async function getUser(id: string) {
  const cached = await userCache.get<User>(id);
  if (cached) return cached;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (user) {
    await userCache.set(id, user);
  }

  return user;
}
```

### 3. API Response Optimization

```typescript
// Compression middleware
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
}));

// Response streaming
export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      for await (const chunk of generateData()) {
        controller.enqueue(encoder.encode(JSON.stringify(chunk)));
      }
      
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    },
  });
}
```

## Monitoring and Metrics

### 1. Performance Monitoring

```typescript
// Custom performance metrics
export function trackPerformance(name: string, fn: () => Promise<any>) {
  return async (...args: any[]) => {
    const start = performance.now();
    try {
      return await fn(...args);
    } finally {
      const duration = performance.now() - start;
      metrics.histogram('function_duration', duration, {
        function: name,
      });
    }
  };
}

// Usage
const getUsers = trackPerformance('getUsers', async () => {
  return prisma.user.findMany();
});
```

### 2. Resource Monitoring

```typescript
// Memory usage monitoring
function trackMemoryUsage() {
  const used = process.memoryUsage();
  
  metrics.gauge('memory_usage_heap', used.heapUsed);
  metrics.gauge('memory_usage_total', used.rss);
}

// CPU usage monitoring
function trackCPUUsage() {
  const startUsage = process.cpuUsage();
  
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    metrics.gauge('cpu_user', endUsage.user);
    metrics.gauge('cpu_system', endUsage.system);
  }, 1000);
}
```

## Load Testing

```typescript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

## Best Practices

1. **Frontend**
   - Use production builds
   - Implement code splitting
   - Optimize images and fonts
   - Use service workers for caching
   - Implement progressive loading

2. **Backend**
   - Optimize database queries
   - Implement appropriate caching
   - Use connection pooling
   - Implement request queuing
   - Monitor resource usage

3. **Database**
   - Index frequently queried fields
   - Use appropriate data types
   - Regular maintenance
   - Query optimization
   - Connection pooling

4. **Caching**
   - Multi-level caching
   - Cache invalidation strategy
   - Cache warming
   - Cache monitoring
   - TTL management
