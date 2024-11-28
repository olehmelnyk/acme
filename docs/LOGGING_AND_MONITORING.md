# Logging and Monitoring

## Overview

This document outlines our comprehensive logging and monitoring strategy across the application.

## Logging Strategy

### Logger Selection: Pino

We've chosen Pino as our primary logging library for its excellent performance and features:

```typescript
// logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Usage example
logger.info({ userId: '123' }, 'User logged in');
```

### Log Levels

1. **ERROR**: System errors and critical issues
2. **WARN**: Warning conditions
3. **INFO**: General operational information
4. **DEBUG**: Detailed debugging information
5. **TRACE**: Very detailed debugging information

### Structured Logging

```typescript
// Example structured logging
interface LogContext {
  requestId: string;
  userId?: string;
  action: string;
  duration?: number;
}

const logWithContext = (context: LogContext, message: string) => {
  logger.info({
    ...context,
    timestamp: new Date().toISOString(),
  }, message);
};
```

## Monitoring Setup

### 1. Application Monitoring (Sentry)

```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/yourwebsite\.com/],
    }),
  ],
});
```

### 2. Performance Monitoring (Datadog)

```typescript
// datadog.config.ts
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.DD_APPLICATION_ID,
  clientToken: process.env.DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'your-app-name',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  sessionSampleRate: 100,
  premiumSampleRate: 100,
  trackUserInteractions: true,
  defaultPrivacyLevel: 'mask-user-input',
});
```

### 3. Infrastructure Monitoring (Prometheus + Grafana)

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nodejs'
    static_configs:
      - targets: ['localhost:9090']
```

### 4. Custom Metrics

```typescript
// metrics.ts
import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Define metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Register metrics
register.registerMetric(httpRequestDuration);
```

## Monitoring Categories

### 1. Error Monitoring

```typescript
// Error tracking with Sentry
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err);
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});
```

### 2. Performance Monitoring

```typescript
// Performance tracking
const trackPerformance = async (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    httpRequestDuration
      .labels(req.method, req.route.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
};
```

### 3. Security Monitoring

```typescript
// Security event logging
const securityLogger = {
  logAuthAttempt: (userId: string, success: boolean) => {
    logger.info({
      event: 'auth_attempt',
      userId,
      success,
      ip: req.ip,
    });
  },
};
```

### 4. Business Metrics

```typescript
// Business metrics tracking
const businessMetrics = new client.Counter({
  name: 'business_transactions_total',
  help: 'Total business transactions',
  labelNames: ['type', 'status'],
});

// Usage
businessMetrics.labels('order', 'completed').inc();
```

## Alerting

### 1. Sentry Alerts

```typescript
// sentry.config.ts
Sentry.init({
  beforeSend(event) {
    if (event.level === 'fatal') {
      // Custom notification logic
      notifyTeam(event);
    }
    return event;
  },
});
```

### 2. Prometheus Alerting

```yaml
# alertmanager.yml
groups:
  - name: example
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
```

## Dashboard Examples

### 1. Grafana Dashboard

```json
{
  "dashboard": {
    "panels": [
      {
        "title": "Request Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      }
    ]
  }
}
```

### 2. Custom Status Page

```typescript
// status.ts
const getSystemStatus = async () => {
  const metrics = await register.getMetricsAsJSON();
  const health = await checkHealth();
  
  return {
    uptime: process.uptime(),
    metrics,
    health,
    version: process.env.APP_VERSION,
  };
};
```

## Best Practices

1. **Logging**
   - Use structured logging
   - Include context
   - Proper log levels
   - Sensitive data handling

2. **Monitoring**
   - Define SLOs/SLIs
   - Set up proper alerting
   - Regular dashboard reviews
   - Incident response plan

3. **Performance**
   - Monitor key metrics
   - Set performance budgets
   - Regular performance reviews
   - Optimize based on data

4. **Security**
   - Monitor security events
   - Track authentication
   - Alert on anomalies
   - Regular security reviews
