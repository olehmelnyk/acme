# Testing Strategy

## Overview

Our testing strategy encompasses:
- Unit testing
- Integration testing
- End-to-end testing
- Performance testing
- Security testing
- Visual regression testing

## Test Implementation

### 1. Unit Testing with Vitest

```typescript
// src/components/Button/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button onClick={onClick}>Click me</Button>
    );
    
    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies disabled styles when disabled', () => {
    const { getByRole } = render(
      <Button disabled>Click me</Button>
    );
    
    const button = getByRole('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveClass('opacity-50');
  });
});
```

### 2. Integration Testing

```typescript
// src/features/auth/__tests__/auth.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestClient } from '@trpc/client/test';
import { appRouter } from '../../../server/router';
import { prisma } from '../../../server/db';

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('allows user registration and login', async () => {
    const client = createTestClient({
      router: appRouter,
    });

    // Register
    const user = await client.mutation('auth.register', {
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(user.id).toBeDefined();

    // Login
    const session = await client.mutation('auth.login', {
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(session.token).toBeDefined();

    // Get profile
    const profile = await client.query('auth.me', undefined, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    expect(profile.email).toBe('test@example.com');
  });
});
```

### 3. E2E Testing with Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('successful login flow', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Check redirect
    await expect(page).toHaveURL('/dashboard');
    
    // Verify logged in state
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
    await expect(userMenu).toContainText('user@example.com');
  });

  test('displays validation errors', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check error messages
    await expect(page.locator('#email-error'))
      .toContainText('Email is required');
    await expect(page.locator('#password-error'))
      .toContainText('Password is required');
  });
});
```

### 4. Performance Testing

```typescript
// performance/api.perf.ts
import autocannon from 'autocannon';

async function runBenchmark() {
  const result = await autocannon({
    url: 'http://localhost:3000/api/users',
    connections: 100,
    duration: 30,
    headers: {
      'Authorization': 'Bearer test-token',
    },
    requests: [
      {
        method: 'POST',
        path: '/api/users',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        method: 'GET',
        path: '/api/users',
      },
    ],
  });

  console.log(result);
}

runBenchmark();
```

### 5. Visual Regression Testing

```typescript
// visual-regression/components.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('button states', async ({ page }) => {
    await page.goto('/storybook/button');

    // Capture default state
    await expect(page).toHaveScreenshot('button-default.png');

    // Capture hover state
    await page.hover('button');
    await expect(page).toHaveScreenshot('button-hover.png');

    // Capture disabled state
    await page.click('[data-testid="toggle-disabled"]');
    await expect(page).toHaveScreenshot('button-disabled.png');
  });
});
```

## Test Configuration

### 1. Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
    globals: true,
  },
});
```

### 2. Playwright Configuration

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'Safari',
      use: { browserName: 'webkit' },
    },
  ],
};

export default config;
```

## Test Utilities

### 1. Test Database

```typescript
// src/test/db.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export async function setupTestDatabase() {
  const prisma = new PrismaClient();
  
  // Reset database
  execSync('npm run db:reset');
  
  // Seed test data
  await prisma.user.createMany({
    data: [
      {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
      },
    ],
  });
  
  return prisma;
}
```

### 2. Test Fixtures

```typescript
// src/test/fixtures.ts
import { faker } from '@faker-js/faker';

export function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.recent(),
    ...overrides,
  };
}

export function createOrder(overrides = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    total: faker.number.float({ min: 10, max: 1000 }),
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'completed',
    ]),
    createdAt: faker.date.recent(),
    ...overrides,
  };
}
```

## Test Patterns

### 1. Component Testing Pattern

```typescript
// src/test/patterns/component.ts
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '../../store';

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {ui}
      </Provider>
    </QueryClientProvider>
  );
}
```

### 2. API Testing Pattern

```typescript
// src/test/patterns/api.ts
import { createServer } from '../../server';
import supertest from 'supertest';

export function createTestServer() {
  const app = createServer();
  return {
    app,
    request: supertest(app),
  };
}

export async function authenticatedRequest(
  request: supertest.SuperTest<supertest.Test>,
  token: string
) {
  return request.set('Authorization', `Bearer ${token}`);
}
```

## Test Monitoring

### 1. Test Reports

```typescript
// src/test/reporters/custom.ts
import { Reporter } from '@vitest/reporter';

export default class CustomReporter implements Reporter {
  onTestComplete(test: any) {
    console.log(`Test: ${test.name}`);
    console.log(`Duration: ${test.duration}ms`);
    console.log(`Status: ${test.state}`);
  }

  onFinished(files: any[]) {
    const stats = {
      total: files.length,
      passed: files.filter(f => f.state === 'passed').length,
      failed: files.filter(f => f.state === 'failed').length,
    };
    
    console.table(stats);
  }
}
```

### 2. Coverage Reports

```typescript
// src/test/coverage.ts
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createReport } from 'istanbul-reports';
import { createContext } from 'istanbul-lib-report';

export async function generateCoverageReport(
  coverageData: any
) {
  const coverageMap = createCoverageMap(coverageData);
  
  const context = createContext({
    dir: './coverage',
    coverageMap,
  });
  
  const report = createReport('html', {
    skipEmpty: true,
    skipFull: false,
  });
  
  report.execute(context);
}
```

## Best Practices

1. **Test Organization**
   ```typescript
   // Bad
   test('it works', () => {
     // Long, unorganized test
   });
   
   // Good
   describe('UserProfile', () => {
     describe('when logged in', () => {
       it('displays user information', () => {
         // Specific test
       });
       
       it('allows editing profile', () => {
         // Specific test
       });
     });
   });
   ```

2. **Test Isolation**
   ```typescript
   // Bad
   let user;
   
   beforeAll(() => {
     user = createUser();
   });
   
   // Good
   beforeEach(() => {
     vi.resetAllMocks();
   });
   
   it('test case', () => {
     const user = createUser();
     // Test with local data
   });
   ```

3. **Async Testing**
   ```typescript
   // Bad
   test('async operation', () => {
     someAsyncOperation();
     expect(something).toBe(true);
   });
   
   // Good
   test('async operation', async () => {
     await someAsyncOperation();
     expect(something).toBe(true);
   });
   ```

## Testing Checklist

1. **Unit Tests**
   - [ ] Component rendering
   - [ ] Business logic
   - [ ] Utility functions
   - [ ] State management

2. **Integration Tests**
   - [ ] API endpoints
   - [ ] Database operations
   - [ ] Service interactions
   - [ ] Authentication flows

3. **E2E Tests**
   - [ ] Critical user paths
   - [ ] Form submissions
   - [ ] Navigation flows
   - [ ] Error scenarios

4. **Performance Tests**
   - [ ] Load testing
   - [ ] Stress testing
   - [ ] Memory leaks
   - [ ] Response times
