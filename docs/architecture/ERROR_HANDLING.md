# Error Handling Strategy

## Overview

Our application implements a comprehensive error handling strategy that:
- Provides clear, actionable error messages
- Maintains security by not exposing sensitive information
- Enables effective debugging and monitoring
- Ensures consistent error reporting across the stack

## Error Classification

### 1. Operational Errors
```typescript
// src/errors/operational.ts
export class OperationalError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: number = 400,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OperationalError';
  }
}

export class ValidationError extends OperationalError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends OperationalError {
  constructor(resource: string, id: string) {
    super(
      `${resource} with id ${id} not found`,
      'NOT_FOUND',
      404
    );
    this.name = 'NotFoundError';
  }
}
```

### 2. Programming Errors
```typescript
// src/errors/programming.ts
export class ProgrammingError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ProgrammingError';
  }
}

export class ConfigurationError extends ProgrammingError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}
```

## Error Handling Middleware

### 1. Express Middleware
```typescript
// src/middleware/error-handler.ts
import { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';
import { OperationalError } from '../errors/operational';

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  logger.error({
    error,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
  });

  if (error instanceof OperationalError) {
    return res.status(error.httpStatus).json({
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    });
  }

  // Programming errors
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
};
```

### 2. GraphQL Error Handling
```typescript
// src/graphql/error-formatter.ts
import { GraphQLError } from 'graphql';
import { OperationalError } from '../errors/operational';

export const formatError = (error: GraphQLError) => {
  const original = error.originalError;

  if (original instanceof OperationalError) {
    return {
      message: original.message,
      code: original.code,
      details: original.details,
      locations: error.locations,
      path: error.path,
    };
  }

  // Log programming errors
  logger.error(error);

  return {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    locations: error.locations,
    path: error.path,
  };
};
```

## Frontend Error Handling

### 1. API Error Handling
```typescript
// src/api/client.ts
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export class ApiClient {
  async request<T>(config: RequestConfig): Promise<T> {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiError: ApiError = error.response?.data?.error;
        
        switch (apiError.code) {
          case 'VALIDATION_ERROR':
            throw new ValidationError(apiError.message, apiError.details);
          case 'NOT_FOUND':
            throw new NotFoundError(apiError.message);
          default:
            throw new OperationalError(
              apiError.message,
              apiError.code,
              error.response?.status
            );
        }
      }
      
      throw error;
    }
  }
}
```

### 2. React Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';
import { ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('React Error Boundary caught an error:', {
      error,
      info,
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

## Error Monitoring and Logging

### 1. Logging Strategy
```typescript
// src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
  hooks: {
    logMethod(args, method) {
      if (args[0] instanceof Error) {
        const error = args[0];
        args[0] = {
          error: {
            message: error.message,
            stack: error.stack,
            ...error,
          },
        };
      }
      return method.apply(this, args);
    },
  },
});
```

### 2. Error Monitoring
```typescript
// src/utils/monitoring.ts
import * as Sentry from '@sentry/node';
import { OperationalError } from '../errors/operational';

export function initializeErrorMonitoring(): void {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      // Don't send operational errors to Sentry
      if (event.exception?.values?.[0]?.type === 'OperationalError') {
        return null;
      }
      return event;
    },
  });
}

export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (error instanceof OperationalError) {
    // Just log operational errors
    logger.error({ error, context });
    return;
  }

  // Capture programming errors in Sentry
  Sentry.captureException(error, {
    extra: context,
  });
}
```

## Best Practices

1. **Error Creation**
   ```typescript
   // Bad
   throw new Error('User not found');
   
   // Good
   throw new NotFoundError('User', id);
   ```

2. **Error Handling**
   ```typescript
   // Bad
   try {
     await doSomething();
   } catch (error) {
     console.error(error);
   }
   
   // Good
   try {
     await doSomething();
   } catch (error) {
     if (error instanceof OperationalError) {
       logger.warn({ error });
       // Handle known error
     } else {
       captureError(error);
       throw error; // Re-throw programming errors
     }
   }
   ```

3. **Async Error Handling**
   ```typescript
   // Bad
   router.get('/users/:id', async (req, res) => {
     const user = await getUser(req.params.id);
     res.json(user);
   });
   
   // Good
   router.get('/users/:id', asyncHandler(async (req, res) => {
     const user = await getUser(req.params.id);
     res.json(user);
   }));
   ```

## Error Response Format

```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
    stack?: string; // Only in development
  };
}

// Example responses
const validationError: ErrorResponse = {
  error: {
    message: 'Invalid input',
    code: 'VALIDATION_ERROR',
    details: {
      email: 'Must be a valid email address',
    },
  },
};

const notFoundError: ErrorResponse = {
  error: {
    message: 'User with id 123 not found',
    code: 'NOT_FOUND',
  },
};
```

## Testing Error Handling

```typescript
// src/__tests__/error-handling.test.ts
describe('Error Handling', () => {
  it('handles validation errors', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid' });
    
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        message: expect.any(String),
        details: expect.any(Object),
      },
    });
  });

  it('handles not found errors', async () => {
    const response = await request(app)
      .get('/api/users/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: {
        code: 'NOT_FOUND',
        message: expect.any(String),
      },
    });
  });

  it('handles programming errors', async () => {
    const response = await request(app)
      .get('/api/trigger-error');
    
    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  });
});
```
