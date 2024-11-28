# Database Architecture and Schema Design

## Overview

This document outlines our database architecture using both Prisma and Drizzle ORMs, focusing on schema design, synchronization, and code generation strategies.

## Dual ORM Strategy

### Why Both Prisma and Drizzle?

1. **Prisma**
   - Strong schema definition and migrations
   - Powerful code generation capabilities
   - Excellent TypeScript integration
   - Rich ecosystem of generators

2. **Drizzle**
   - Type-safe SQL query builder
   - Better performance for complex queries
   - Lower memory footprint
   - More flexible query composition

## Schema Synchronization

### Workflow

1. **Primary Schema Definition (Prisma)**
   ```prisma
   // schema.prisma
   model User {
     id        String   @id @default(uuid())
     email     String   @unique
     name      String?
     role      Role     @default(USER)
     posts     Post[]
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Schema Introspection**
   - Automated script to generate Drizzle schema from Prisma
   - Maintains consistency between ORMs
   - Handles type mappings

3. **Validation Layer**
   ```typescript
   // schema.validation.ts
   export const userSchema = z.object({
     id: z.string().uuid(),
     email: z.string().email(),
     name: z.string().optional(),
     role: z.enum(['USER', 'ADMIN']),
     createdAt: z.date(),
     updatedAt: z.date()
   });
   ```

## Code Generation

### Prisma Generators

1. **TypeScript Types**
   - Models
   - Enums
   - Input types
   - Query builders

2. **API Generation**
   ```typescript
   // Generated REST endpoints
   export class UsersApi {
     async createUser(data: CreateUserDTO): Promise<User>
     async updateUser(id: string, data: UpdateUserDTO): Promise<User>
     async deleteUser(id: string): Promise<void>
     // ...
   }
   ```

3. **GraphQL Schema**
   ```graphql
   type User {
     id: ID!
     email: String!
     name: String
     role: Role!
     posts: [Post!]!
     createdAt: DateTime!
     updatedAt: DateTime!
   }
   ```

4. **tRPC Procedures**
   ```typescript
   export const userRouter = router({
     create: protectedProcedure
       .input(createUserSchema)
       .mutation(({ input }) => { /* ... */ }),
     // ...
   });
   ```

### Database Seeds

```typescript
// seeds/users.ts
export const userSeeds = [
  {
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  },
  // ...
];
```

## Best Practices

1. **Schema Design**
   - Use UUIDs for primary keys
   - Include audit fields (createdAt, updatedAt)
   - Proper indexing strategy
   - Consistent naming conventions

2. **Type Safety**
   - No raw SQL queries
   - Use generated types
   - Validate all inputs
   - Handle all edge cases

3. **Performance**
   - Use appropriate indexes
   - Optimize query patterns
   - Monitor query performance
   - Use connection pooling

4. **Migrations**
   - Version control migrations
   - Test migrations
   - Have rollback plans
   - Document breaking changes

## Development Workflow

1. **Schema Updates**
   ```bash
   # 1. Update Prisma schema
   # 2. Generate Prisma client
   bunx prisma generate
   # 3. Run schema sync script
   bun run sync-schema
   # 4. Generate Drizzle types
   bunx drizzle-kit generate
   ```

2. **Testing**
   - Unit tests for models
   - Integration tests for queries
   - Migration tests
   - Seed data tests

## Monitoring and Maintenance

1. **Performance Monitoring**
   - Query execution times
   - Connection pool usage
   - Cache hit rates
   - Slow query logs

2. **Maintenance Tasks**
   - Regular backups
   - Index optimization
   - Stats collection
   - Schema updates
