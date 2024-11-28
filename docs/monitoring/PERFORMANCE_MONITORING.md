# Performance Monitoring

## Overview

Our performance monitoring strategy covers:
- Application performance monitoring (APM)
- Infrastructure monitoring
- Real user monitoring (RUM)
- Error tracking
- Alerting

## Monitoring Stack

### 1. Application Metrics

```typescript
// src/monitoring/metrics.ts
import { Counter, Histogram } from 'prom-client';
import { register } from './prometheus';

// HTTP Request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Database query metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

// Cache metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache'],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache'],
});
```

### 2. Tracing Configuration

```typescript
// src/monitoring/tracing.ts
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { trace } from '@opentelemetry/api';

export function initializeTracing() {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'my-service',
    }),
  });

  const exporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT,
  });

  provider.addSpanProcessor(
    new SimpleSpanProcessor(exporter)
  );

  provider.register();

  return trace.getTracer('my-service');
}
```

### 3. Real User Monitoring

```typescript
// src/monitoring/rum.ts
import { init as initDatadog } from '@datadog/browser-rum';

export function initializeRUM() {
  initDatadog({
    applicationId: process.env.DD_APPLICATION_ID,
    clientToken: process.env.DD_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'my-service',
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
    sessionSampleRate: 100,
    premiumSampleRate: 100,
    trackUserInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
}
```

## Monitoring Middleware

### 1. Request Monitoring

```typescript
// src/middleware/monitoring.ts
import { RequestHandler } from 'express';
import { httpRequestDuration } from '../monitoring/metrics';

export const requestMonitoring: RequestHandler = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    httpRequestDuration
      .labels(req.method, req.route?.path || 'unknown', res.statusCode.toString())
      .observe(duration);
  });

  next();
};
```

### 2. Database Monitoring

```typescript
// src/db/monitoring.ts
import { dbQueryDuration } from '../monitoring/metrics';

export async function monitorQuery<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = process.hrtime();

  try {
    return await queryFn();
  } finally {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    dbQueryDuration
      .labels(operation, table)
      .observe(duration);
  }
}
```

## Performance Profiling

### 1. CPU Profiling

```typescript
// src/monitoring/profiling.ts
import * as v8Profiler from 'v8-profiler-next';
import { writeFileSync } from 'fs';

export async function captureHeapSnapshot(name: string): Promise<void> {
  const snapshot = v8Profiler.takeSnapshot();
  writeFileSync(`${name}-${Date.now()}.heapsnapshot`, snapshot.export());
  snapshot.delete();
}

export async function captureCPUProfile(
  name: string,
  durationMs: number
): Promise<void> {
  v8Profiler.startProfiling(name, true);
  
  await new Promise(resolve => setTimeout(resolve, durationMs));
  
  const profile = v8Profiler.stopProfiling(name);
  writeFileSync(`${name}-${Date.now()}.cpuprofile`, profile.export());
  profile.delete();
}
```

### 2. Memory Monitoring

```typescript
// src/monitoring/memory.ts
import { Gauge } from 'prom-client';

const heapUsed = new Gauge({
  name: 'nodejs_heap_used_bytes',
  help: 'Node.js heap usage in bytes',
});

const heapTotal = new Gauge({
  name: 'nodejs_heap_total_bytes',
  help: 'Node.js total heap in bytes',
});

export function recordMemoryMetrics(): void {
  const memory = process.memoryUsage();
  
  heapUsed.set(memory.heapUsed);
  heapTotal.set(memory.heapTotal);
}

// Record every 5 seconds
setInterval(recordMemoryMetrics, 5000);
```

## Performance Testing

### 1. Load Testing Configuration

```typescript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% can fail
  },
};

export default function() {
  const response = http.get('http://test.loadimpact.com');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### 2. Stress Testing

```typescript
// k6/stress-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 300 },   // Ramp up to 300 users
    { duration: '5m', target: 300 },   // Stay at 300 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    http_req_failed: ['rate<0.02'],    // Less than 2% can fail
  },
};

export default function() {
  const responses = http.batch([
    ['GET', 'https://test.k6.io/'],
    ['GET', 'https://test.k6.io/contacts.php'],
    ['GET', 'https://test.k6.io/news.php'],
  ]);
  
  check(responses[0], {
    'main page status was 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

## Alerting Configuration

### 1. Prometheus Alerting Rules

```yaml
# prometheus/rules/alerts.yml
groups:
  - name: main
    rules:
      - alert: HighRequestLatency
        expr: http_request_duration_seconds{quantile="0.9"} > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High request latency on {{ $labels.instance }}
          description: 90th percentile of request latency is above 1s

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate on {{ $labels.instance }}
          description: Error rate is above 1%

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage on {{ $labels.instance }}
          description: Memory usage is above 90%
```

### 2. Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "id": null,
    "title": "Service Overview",
    "tags": ["service"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{route}}"
          }
        ]
      }
    ]
  }
}
```

## Best Practices

1. **Metric Naming**
   ```typescript
   // Bad
   const requests = new Counter({ name: 'requests' });
   
   // Good
   const httpRequestsTotal = new Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'route', 'status_code'],
   });
   ```

2. **Label Usage**
   ```typescript
   // Bad - Too many label combinations
   const metrics = new Counter({
     name: 'requests',
     labelNames: ['method', 'path', 'status', 'user', 'region', 'browser'],
   });
   
   // Good - Essential labels only
   const metrics = new Counter({
     name: 'http_requests_total',
     labelNames: ['method', 'route', 'status_code'],
   });
   ```

3. **Error Budget Tracking**
   ```typescript
   // src/monitoring/slo.ts
   const errorBudget = new Gauge({
     name: 'error_budget_remaining',
     help: 'Remaining error budget for the service',
   });
   
   function updateErrorBudget(
     totalRequests: number,
     errorRequests: number
   ): void {
     const errorRate = errorRequests / totalRequests;
     const remainingBudget = 0.001 - errorRate; // 99.9% SLO
     errorBudget.set(remainingBudget);
   }
   ```

## Monitoring Checklist

1. **Application Health**
   - [ ] Request latency
   - [ ] Error rates
   - [ ] Success rates
   - [ ] Resource usage

2. **Infrastructure Health**
   - [ ] CPU usage
   - [ ] Memory usage
   - [ ] Disk I/O
   - [ ] Network I/O

3. **Business Metrics**
   - [ ] Active users
   - [ ] Transaction rates
   - [ ] Conversion rates
   - [ ] Revenue metrics

4. **Dependencies Health**
   - [ ] Database performance
   - [ ] Cache hit rates
   - [ ] External API latencies
   - [ ] Message queue depths
