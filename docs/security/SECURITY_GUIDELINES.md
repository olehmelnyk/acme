# Security Guidelines

## Overview

Our security strategy encompasses:
- Authentication and authorization
- Data protection
- API security
- Infrastructure security
- Security monitoring
- Incident response

## Authentication

### 1. JWT Implementation

```typescript
// src/auth/jwt.ts
import { sign, verify } from 'jsonwebtoken';
import { createHash } from 'crypto';

interface TokenPayload {
  sub: string;
  roles: string[];
  sessionId: string;
}

export class JwtService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string = '15m'
  ) {}

  generateToken(payload: TokenPayload): string {
    return sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      algorithm: 'HS256',
    });
  }

  verifyToken(token: string): TokenPayload {
    return verify(token, this.secret) as TokenPayload;
  }

  generateRefreshToken(userId: string): string {
    const hash = createHash('sha256');
    const timestamp = Date.now().toString();
    
    return hash.update(`${userId}-${timestamp}-${this.secret}`).digest('hex');
  }
}
```

### 2. OAuth2 Integration

```typescript
// src/auth/oauth.ts
import { OAuth2Client } from 'google-auth-library';

export class OAuthService {
  private readonly client: OAuth2Client;

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) {
    this.client = new OAuth2Client(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  async verifyIdToken(token: string): Promise<void> {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: this.client.clientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token');
    }
  }
}
```

## Authorization

### 1. RBAC Implementation

```typescript
// src/auth/rbac.ts
type Permission = 'create' | 'read' | 'update' | 'delete';
type Resource = 'user' | 'post' | 'comment';

interface Role {
  name: string;
  permissions: Array<{
    resource: Resource;
    actions: Permission[];
  }>;
}

export class RBACService {
  private readonly roles: Map<string, Role> = new Map();

  addRole(role: Role): void {
    this.roles.set(role.name, role);
  }

  hasPermission(
    role: string,
    resource: Resource,
    action: Permission
  ): boolean {
    const roleData = this.roles.get(role);
    if (!roleData) return false;

    const resourcePerms = roleData.permissions.find(
      p => p.resource === resource
    );
    
    return resourcePerms?.actions.includes(action) ?? false;
  }
}
```

### 2. Permission Middleware

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { RBACService } from '../auth/rbac';

export function checkPermission(
  resource: Resource,
  action: Permission
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const rbac = new RBACService();

    if (!user?.roles?.some(role => 
      rbac.hasPermission(role, resource, action)
    )) {
      return res.status(403).json({
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}
```

## Data Protection

### 1. Encryption Service

```typescript
// src/security/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class EncryptionService {
  constructor(
    private readonly key: Buffer,
    private readonly algorithm: string = 'aes-256-gcm'
  ) {}

  encrypt(data: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(
    encrypted: string,
    iv: string,
    tag: string
  ): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 2. PII Handling

```typescript
// src/security/pii.ts
interface PIIFields {
  [key: string]: boolean;
}

const PII_FIELDS: PIIFields = {
  ssn: true,
  creditCard: true,
  password: true,
  email: true,
};

export function maskPII(
  data: Record<string, any>,
  fields: PIIFields = PII_FIELDS
): Record<string, any> {
  const masked = { ...data };
  
  for (const [key, value] of Object.entries(masked)) {
    if (fields[key]) {
      masked[key] = '********';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskPII(value, fields);
    }
  }
  
  return masked;
}
```

## API Security

### 1. Rate Limiting

```typescript
// src/security/rate-limit.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

export class RateLimiter {
  private limiter: RateLimiterRedis;

  constructor(
    redis: Redis,
    points: number = 10,
    duration: number = 1
  ) {
    this.limiter = new RateLimiterRedis({
      storeClient: redis,
      points,
      duration,
      blockDuration: duration * 2,
    });
  }

  async consume(key: string): Promise<void> {
    try {
      await this.limiter.consume(key);
    } catch (error) {
      throw new Error('Too many requests');
    }
  }
}
```

### 2. Input Validation

```typescript
// src/security/validation.ts
import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  name: z.string().min(2),
});

export function validateInput<T>(
  schema: z.Schema<T>,
  data: unknown
): T {
  return schema.parse(data);
}
```

## Infrastructure Security

### 1. Network Security

```typescript
// src/security/network.ts
import helmet from 'helmet';
import { Express } from 'express';

export function configureSecurityHeaders(app: Express): void {
  app.use(helmet());
  
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );
    next();
  });
}
```

### 2. Secrets Management

```typescript
// src/security/secrets.ts
import { SecretsManager } from 'aws-sdk';

export class SecretManager {
  private readonly client: SecretsManager;

  constructor() {
    this.client = new SecretsManager({
      region: process.env.AWS_REGION,
    });
  }

  async getSecret(secretId: string): Promise<string> {
    const data = await this.client
      .getSecretValue({ SecretId: secretId })
      .promise();
    
    if (data.SecretString) {
      return data.SecretString;
    }
    
    throw new Error('Secret not found');
  }
}
```

## Security Monitoring

### 1. Audit Logging

```typescript
// src/security/audit.ts
interface AuditLog {
  timestamp: Date;
  actor: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
}

export class AuditLogger {
  async log(entry: AuditLog): Promise<void> {
    await prisma.auditLog.create({
      data: {
        timestamp: entry.timestamp,
        actor: entry.actor,
        action: entry.action,
        resource: entry.resource,
        details: entry.details,
      },
    });
  }

  async query(
    filters: Partial<AuditLog>
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: filters,
      orderBy: { timestamp: 'desc' },
    });
  }
}
```

### 2. Security Events

```typescript
// src/security/events.ts
interface SecurityEvent {
  type: 'auth_failure' | 'suspicious_activity' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: Record<string, unknown>;
}

export class SecurityEventMonitor {
  async reportEvent(event: SecurityEvent): Promise<void> {
    // Log to security monitoring system
    await logger.alert('Security event detected', {
      ...event,
      timestamp: new Date(),
    });

    // Alert if critical
    if (event.severity === 'critical') {
      await this.triggerAlert(event);
    }
  }

  private async triggerAlert(
    event: SecurityEvent
  ): Promise<void> {
    await sns.publish({
      TopicArn: process.env.SECURITY_ALERT_TOPIC,
      Message: JSON.stringify(event),
      MessageAttributes: {
        severity: {
          DataType: 'String',
          StringValue: event.severity,
        },
      },
    }).promise();
  }
}
```

## Incident Response

### 1. Response Plan

```typescript
// src/security/incident.ts
interface IncidentReport {
  id: string;
  type: string;
  severity: string;
  status: 'open' | 'investigating' | 'resolved';
  description: string;
  timeline: Array<{
    timestamp: Date;
    action: string;
    actor: string;
  }>;
}

export class IncidentResponse {
  async createIncident(
    report: Omit<IncidentReport, 'id' | 'timeline'>
  ): Promise<string> {
    const incident = await prisma.incident.create({
      data: {
        ...report,
        id: generateId(),
        timeline: [],
      },
    });
    
    await this.notifyTeam(incident);
    
    return incident.id;
  }

  async updateIncident(
    id: string,
    action: string,
    actor: string
  ): Promise<void> {
    await prisma.incident.update({
      where: { id },
      data: {
        timeline: {
          push: {
            timestamp: new Date(),
            action,
            actor,
          },
        },
      },
    });
  }
}
```

### 2. Recovery Procedures

```typescript
// src/security/recovery.ts
interface RecoveryPlan {
  steps: Array<{
    order: number;
    action: string;
    verification: string;
  }>;
  rollback: Array<{
    order: number;
    action: string;
    verification: string;
  }>;
}

export class DisasterRecovery {
  async executeRecovery(
    plan: RecoveryPlan
  ): Promise<boolean> {
    for (const step of plan.steps) {
      try {
        await this.executeStep(step);
      } catch (error) {
        await this.rollback(plan);
        return false;
      }
    }
    
    return true;
  }

  private async rollback(
    plan: RecoveryPlan
  ): Promise<void> {
    for (const step of plan.rollback) {
      await this.executeStep(step);
    }
  }
}
```

## Security Checklist

1. **Authentication**
   - [ ] Multi-factor authentication
   - [ ] Password policies
   - [ ] Session management
   - [ ] OAuth integration

2. **Authorization**
   - [ ] Role-based access control
   - [ ] Permission management
   - [ ] API authorization
   - [ ] Resource access control

3. **Data Protection**
   - [ ] Encryption at rest
   - [ ] Encryption in transit
   - [ ] Key management
   - [ ] Data backup

4. **API Security**
   - [ ] Rate limiting
   - [ ] Input validation
   - [ ] Output sanitization
   - [ ] API authentication

5. **Infrastructure**
   - [ ] Network security
   - [ ] Container security
   - [ ] Cloud security
   - [ ] Secrets management

6. **Monitoring**
   - [ ] Audit logging
   - [ ] Security events
   - [ ] Alerts configuration
   - [ ] Incident detection

7. **Response**
   - [ ] Incident response plan
   - [ ] Recovery procedures
   - [ ] Communication plan
   - [ ] Documentation
