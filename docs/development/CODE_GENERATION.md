# Code Generation Guidelines

## Overview

Our project uses code generation to:
- Ensure type safety across the stack
- Reduce boilerplate code
- Maintain consistency
- Automate repetitive tasks

## Code Generators

### 1. GraphQL Code Generator

```yaml
# codegen.yml
schema: src/schema.graphql
documents: src/**/*.graphql
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query
    config:
      fetcher: graphql-request
      withHooks: true
      withComponent: false
      withHOC: false
```

Example Usage:
```typescript
// src/graphql/queries/user.graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}

// Generated hook usage
function UserProfile({ id }: { id: string }) {
  const { data, loading } = useGetUserQuery({ id });
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{data?.user.name}</div>;
}
```

### 2. Prisma Generator

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

generator zod {
  provider = "zod-prisma"
  output   = "./zod"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
}
```

Generated Types Usage:
```typescript
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { UserSchema } from './zod';

// Type-safe operations
const createUser = async (data: Prisma.UserCreateInput) => {
  // Validate with generated Zod schema
  const validated = UserSchema.parse(data);
  return prisma.user.create({ data: validated });
};
```

### 3. tRPC Generator

```typescript
// src/server/routers/_app.ts
export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;

// Generated client usage
import { createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from './server/routers/_app';

const client = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});
```

### 4. API Client Generator

```typescript
// src/openapi/generate.ts
import { generateApi } from 'swagger-typescript-api';

generateApi({
  name: 'api.ts',
  output: './src/generated',
  url: 'http://localhost:3000/api/swagger.json',
  httpClientType: 'fetch',
  generateClient: true,
  generateRouteTypes: true,
});
```

## Custom Generators

### 1. Component Generator

```typescript
// scripts/generate-component.ts
import { generateTemplate } from './templates';

interface ComponentConfig {
  name: string;
  type: 'atom' | 'molecule' | 'organism';
  props?: Record<string, string>;
}

function generateComponent(config: ComponentConfig): void {
  const files = [
    {
      path: `src/components/${config.type}s/${config.name}`,
      content: generateTemplate('component', config),
    },
    {
      path: `src/components/${config.type}s/${config.name}/index.ts`,
      content: generateTemplate('index', config),
    },
    {
      path: `src/components/${config.type}s/${config.name}/${config.name}.test.tsx`,
      content: generateTemplate('test', config),
    },
    {
      path: `src/components/${config.type}s/${config.name}/${config.name}.stories.tsx`,
      content: generateTemplate('story', config),
    },
  ];

  files.forEach(({ path, content }) => {
    writeFileSync(path, content);
  });
}
```

### 2. CRUD Generator

```typescript
// scripts/generate-crud.ts
interface CrudConfig {
  model: string;
  fields: Record<string, string>;
  relations?: Record<string, string>;
}

function generateCrud(config: CrudConfig): void {
  // Generate model
  generatePrismaModel(config);
  
  // Generate API endpoints
  generateApiEndpoints(config);
  
  // Generate frontend components
  generateComponents(config);
  
  // Generate tests
  generateTests(config);
}
```

## Templates

### 1. Component Template

```typescript
// templates/component.ts
export const componentTemplate = ({
  name,
  props,
}: ComponentConfig): string => `
import React from 'react';
import styles from './${name}.module.css';

interface ${name}Props {
  ${Object.entries(props || {})
    .map(([key, type]) => `${key}: ${type};`)
    .join('\n  ')}
}

export const ${name}: React.FC<${name}Props> = ({
  ${Object.keys(props || {}).join(', ')}
}) => {
  return (
    <div className={styles.root}>
      {/* Component content */}
    </div>
  );
};
`;
```

### 2. Test Template

```typescript
// templates/test.ts
export const testTemplate = ({
  name,
}: ComponentConfig): string => `
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} />);
    // Add assertions
  });
});
`;
```

## Best Practices

1. **Type Safety**
   - Always generate TypeScript types
   - Use strict type checking
   - Generate validation schemas

2. **Code Organization**
   - Keep generated code separate
   - Don't modify generated files
   - Use .gitignore for generated files

3. **Documentation**
   - Generate documentation
   - Include usage examples
   - Document generator options

4. **Testing**
   - Generate test files
   - Include test templates
   - Generate test data

5. **Maintenance**
   - Regular generator updates
   - Version control for templates
   - Automated generation in CI/CD

## Generator Configuration

```json
{
  "generators": {
    "component": {
      "type": "custom",
      "template": "templates/component",
      "output": "src/components",
      "options": {
        "typescript": true,
        "cssModules": true,
        "testing": true,
        "storybook": true
      }
    },
    "api": {
      "type": "openapi",
      "input": "swagger.json",
      "output": "src/generated/api",
      "options": {
        "client": true,
        "types": true,
        "hooks": true
      }
    }
  }
}
```

## Common Issues and Solutions

1. **Type Conflicts**
   ```typescript
   // Bad
   type Generated = any;
   
   // Good
   type Generated = unknown;
   interface GeneratedType extends BaseType {}
   ```

2. **Circular Dependencies**
   ```typescript
   // Bad
   // user.ts -> post.ts -> user.ts
   
   // Good
   // types.ts (single source of truth)
   export interface User {
     posts: Post[];
   }
   export interface Post {
     author: Pick<User, 'id' | 'name'>;
   }
   ```

3. **Template Maintenance**
   ```typescript
   // Bad
   const template = `
     // Hardcoded template
   `;
   
   // Good
   const template = compileTemplate('component.hbs', {
     // Template variables
   });
   ```
