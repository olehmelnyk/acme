# Troubleshooting Guide

## Common Issues and Solutions

### Development Environment

#### 1. Build Failures

```bash
# Clear build cache
bun run clean

# Reinstall dependencies
rm -rf node_modules
bun install

# Clear TypeScript cache
rm -rf .next
rm -rf dist
```

#### 2. Database Issues

```bash
# Check database connection
docker ps | grep postgres

# Reset database
bun run db:reset

# Check migrations
bun run db:migrate:status
```

#### 3. Type Errors

```typescript
// Example: Fixing common type errors

// Problem: Object is possibly undefined
const user?: User;
console.log(user.name); // Error

// Solution: Use optional chaining
console.log(user?.name);

// Problem: Type 'string | undefined'
const value = obj.prop;
const length = value.length; // Error

// Solution: Use type guard
if (typeof value === 'string') {
  const length = value.length;
}
```

### Production Issues

#### 1. Performance Problems

```typescript
// Memory Leak Example
class Service {
  private listeners: Function[] = [];
  
  // Problem: Listeners are never removed
  addListener(fn: Function) {
    this.listeners.push(fn);
  }
  
  // Solution: Add cleanup method
  removeListener(fn: Function) {
    this.listeners = this.listeners.filter(l => l !== fn);
  }
}
```

#### 2. API Errors

```typescript
// Error Handling Example
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Failed to fetch data:', error);
    throw new AppError('Failed to fetch data', {
      code: 'DATA_FETCH_ERROR',
      originalError: error
    });
  }
}
```

#### 3. Authentication Issues

```typescript
// Token Refresh Example
async function refreshToken() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const { token } = await response.json();
    return token;
  } catch (error) {
    logger.error('Token refresh failed:', error);
    // Force re-login
    window.location.href = '/login';
  }
}
```

## Debugging Tools

### 1. Browser DevTools

```typescript
// Debug Performance
console.time('operation');
// ... code ...
console.timeEnd('operation');

// Memory Profiling
console.profile('MyProfile');
// ... code ...
console.profileEnd('MyProfile');
```

### 2. Server Logging

```typescript
// Structured Logging Example
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

logger.info({ userId, action }, 'User action performed');
```

### 3. Database Debugging

```sql
-- Slow Query Analysis
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Connection Pool Status
SELECT * FROM pg_stat_activity
WHERE datname = 'your_database';
```

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| AUTH001 | Token expired | Refresh token or re-login |
| DB001 | Connection failed | Check database status |
| API001 | Rate limit exceeded | Implement backoff strategy |
| CACHE001 | Cache miss | Verify Redis connection |

## Health Checks

```typescript
// Health Check Implementation
async function healthCheck() {
  try {
    // Database
    await prisma.$queryRaw`SELECT 1`;
    
    // Redis
    await redis.ping();
    
    // External APIs
    await Promise.all([
      fetch(API_1_HEALTH_URL),
      fetch(API_2_HEALTH_URL)
    ]);
    
    return { status: 'healthy' };
  } catch (error) {
    logger.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}
```

## Monitoring Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| High CPU | >80% for 5m | Scale up |
| Memory Usage | >90% for 5m | Check leaks |
| Error Rate | >1% for 1m | Check logs |
| Response Time | >500ms for 5m | Check performance |

## Recovery Procedures

### 1. Database Recovery
```bash
# Backup
pg_dump -Fc -d database > backup.dump

# Restore
pg_restore -d database backup.dump
```

### 2. Cache Recovery
```bash
# Clear specific cache
redis-cli DEL cache:key

# Clear all cache
redis-cli FLUSHALL
```

### 3. Application Recovery
```bash
# Restart application
pm2 restart app

# Scale down/up
kubectl scale deployment app --replicas=0
kubectl scale deployment app --replicas=3
```
