# API Integration Patterns and Best Practices

## Overview

This document outlines our API architecture, which implements multiple API paradigms (REST, GraphQL, tRPC) with a focus on type safety, performance, and developer experience.

## API Architecture

### Multi-Protocol Support

1. **RESTful API**
   - Resource-oriented endpoints
   - OpenAPI/Swagger documentation
   - Standard HTTP methods
   - Status codes and error handling

2. **GraphQL API**
   - Single endpoint
   - Query optimization
   - Real-time subscriptions
   - Type-safe schema

3. **tRPC API**
   - End-to-end type safety
   - Procedure-based API
   - Automatic client generation
   - Built-in validation

## Implementation Patterns

### REST API

```typescript
// api/rest/users/route.ts
export class UsersController {
  @Get('users')
  async getUsers(
    @Query() pagination: PaginationDTO,
    @Query() filter: UserFilterDTO
  ): Promise<UserResponseDTO[]> {
    // Implementation
  }

  @Post('users')
  @UseGuards(AuthGuard)
  async createUser(
    @Body() data: CreateUserDTO,
    @User() currentUser: JWTPayload
  ): Promise<UserResponseDTO> {
    // Implementation
  }
}
```

### GraphQL API

```typescript
// api/graphql/users/resolver.ts
@Resolver(() => User)
export class UsersResolver {
  @Query(() => [User])
  async users(
    @Args() args: UsersArgs,
    @Context() ctx: GraphQLContext
  ): Promise<User[]> {
    // Implementation
  }

  @Mutation(() => User)
  @UseGuards(GraphQLAuthGuard)
  async createUser(
    @Args('input') input: CreateUserInput,
    @CurrentUser() user: JWTPayload
  ): Promise<User> {
    // Implementation
  }
}
```

### tRPC API

```typescript
// api/trpc/users.ts
export const usersRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Implementation
    }),

  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
});
```

## API Patterns

### Overview

Our application uses multiple API patterns to provide flexibility and optimal performance:
- REST API for standard CRUD operations
- GraphQL for complex data requirements
- tRPC for type-safe internal communication

### REST API

#### Endpoint Structure

```typescript
// Example REST endpoint structure
/api/v1/users                 // List users
/api/v1/users/:id            // Get specific user
/api/v1/users/:id/posts      // Get user's posts
/api/v1/users/:id/followers  // Get user's followers
```

#### Request/Response Format

```typescript
// Request Example
interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

// Response Example
interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

#### Implementation Example

```typescript
// src/api/users/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN']),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = userSchema.parse(body);
    
    const user = await prisma.user.create({
      data: validated,
    });
    
    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

### GraphQL API

#### Schema Definition

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  followers: [User!]!
  following: [User!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
}

type Query {
  user(id: ID!): User
  users(page: Int, limit: Int): [User!]!
  posts(userId: ID): [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}
```

#### Resolver Implementation

```typescript
// src/graphql/resolvers/user.ts
import { builder } from '../builder';

builder.queryField('user', (t) =>
  t.field({
    type: 'User',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, { id }, ctx) => {
      return ctx.prisma.user.findUnique({
        where: { id },
        include: {
          posts: true,
          followers: true,
          following: true,
        },
      });
    },
  })
);

builder.mutationField('createUser', (t) =>
  t.field({
    type: 'User',
    args: {
      input: t.arg({ type: CreateUserInput, required: true }),
    },
    resolve: async (_, { input }, ctx) => {
      return ctx.prisma.user.create({
        data: input,
      });
    },
  })
);
```

### tRPC API

#### Router Definition

```typescript
// src/server/routers/user.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const userRouter = router({
  get: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input },
      });
    }),
    
  create: publicProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: input,
      });
    }),
    
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: userSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.id },
        data: input.data,
      });
    }),
});
```

#### Client Usage

```typescript
// src/app/users/page.tsx
'use client';

import { api } from '~/utils/api';

export default function UsersPage() {
  const { data: users, isLoading } = api.user.list.useQuery();
  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      // Invalidate queries and show success message
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {users?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

## Error Handling

### Common Error Types

```typescript
// src/types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super('Validation failed', 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor() {
    super('Not authenticated', 'AUTH_ERROR', 401);
  }
}
```

### Error Middleware

```typescript
// src/middleware/error.ts
import { NextResponse } from 'next/server';
import { AppError } from '~/types/errors';

export function errorHandler(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }
  
  console.error('Unhandled error:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
    { status: 500 }
  );
}
```

## API Documentation

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
info:
  title: API Documentation
  version: 1.0.0
paths:
  /api/v1/users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
```

### GraphQL Documentation

```graphql
"""
Represents a user in the system
"""
type User {
  """
  Unique identifier for the user
  """
  id: ID!
  
  """
  User's full name
  """
  name: String!
  
  """
  User's email address
  """
  email: String!
}
```

## Rate Limiting

```typescript
// src/middleware/rate-limit.ts
import { rateLimit } from '~/utils/rate-limit';

export async function rateLimitMiddleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const limit = await rateLimit.check(ip);
  
  if (!limit.success) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT',
          message: 'Too many requests',
        },
      },
      { status: 429 }
    );
  }
}
```

## Caching Strategy

```typescript
// src/utils/cache.ts
import { redis } from '~/lib/redis';

export async function cachedData<T>(
  key: string,
  getData: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await getData();
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
  
  return data;
}
```

## API Testing

```typescript
// src/tests/api/users.test.ts
import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '~/app/api/users/route';

describe('Users API', () => {
  it('creates a user successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data.email).toBe('john@example.com');
  });
});
```

## Monitoring

1. **Metrics**
   - Request duration
   - Error rates
   - Status codes
   - Endpoint usage

2. **Logging**
   - Request/response logging
   - Error tracking
   - Performance monitoring
   - Audit trails
