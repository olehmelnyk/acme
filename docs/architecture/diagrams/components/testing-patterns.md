# Component Testing Patterns

This document outlines our component testing strategies and best practices using Vitest and Testing Library.

## Testing Hierarchy

```mermaid
graph TD
    A[Unit Tests] --> B[Component Tests]
    B --> C[Integration Tests]
    C --> D[E2E Tests]
    
    style A fill:#e1f5fe
    style B fill:#e3f2fd
    style C fill:#e8eaf6
    style D fill:#f3e5f5
```

## Testing Patterns

### 1. Component Unit Tests
- Individual component rendering
- Props validation
- Event handlers
- State changes
- Error boundaries

### 2. Component Integration Tests
- Parent-child interactions
- Context providers
- Redux/state management
- Custom hooks
- Event bubbling

### 3. Best Practices
- Use React Testing Library
- Follow AAA pattern (Arrange, Act, Assert)
- Test user interactions
- Mock external dependencies
- Test accessibility
- Test error states

## Code Examples

### Basic Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    await fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test Example
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';
import { UserContext } from './UserContext';

describe('UserProfile Integration', () => {
  test('should display user data from context', async () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    
    render(
      <UserContext.Provider value={user}>
        <UserProfile />
      </UserContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });
  });
});
```

## Testing Guidelines

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Use user-centric queries (getByRole, getByText)
   - Avoid testing implementation details

2. **Isolation and Cleanup**
   - Each test should be independent
   - Clean up after each test
   - Use beforeEach/afterEach hooks

3. **Error Handling**
   - Test error states
   - Verify error messages
   - Test boundary conditions

4. **Accessibility Testing**
   - Use role-based queries
   - Test keyboard navigation
   - Verify ARIA attributes

## Related Documentation
- [Component Architecture](../components/atomic-design.md)
- [Testing Setup](../../testing/setup.md)
- [CI/CD Integration](../../infrastructure/ci-cd-pipeline.md)
