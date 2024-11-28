# Contributing Guidelines

## Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Run tests
bun test

# Run linting
bun lint
```

## Coding Standards

### TypeScript

- Use strict mode
- Proper type definitions
- No `any` types
- Document complex functions

```typescript
// Good
interface UserData {
  id: string;
  name: string;
  email: string;
}

function processUser(user: UserData): void {
  // Implementation
}

// Bad
function processUser(user: any) {
  // Implementation
}
```

### React Components

- Functional components
- Proper prop types
- Custom hooks for logic
- Error boundaries

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

// Bad
const Button = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

## Git Workflow

### Branch Naming

- Feature: `feature/description`
- Bug Fix: `fix/description`
- Documentation: `docs/description`
- Performance: `perf/description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Examples
feat(ui): add new button component
fix(api): handle null user data
docs: update installation guide
```

## Pull Request Process

1. **Title Format**: `<type>(<scope>): <description>`
2. **Description Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   Describe testing done

   ## Screenshots (if applicable)
   Add screenshots

   ## Checklist
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Lint checks pass
   - [ ] Type checks pass
   ```

## Testing Requirements

1. **Unit Tests**
   - New features
   - Bug fixes
   - Edge cases

2. **Integration Tests**
   - API endpoints
   - Component integration
   - Data flow

3. **E2E Tests**
   - Critical paths
   - User workflows

## Documentation

1. **Code Documentation**
   - JSDoc comments
   - Type definitions
   - Complex logic explanation

2. **Feature Documentation**
   - Usage examples
   - API documentation
   - Configuration options

## Review Process

1. **Code Review**
   - Two approvals required
   - Address all comments
   - Pass all checks

2. **QA Review**
   - Functional testing
   - Performance testing
   - Security review

## Release Process

1. **Versioning**
   - Follow [Semantic Versioning](https://semver.org/)
   - Update CHANGELOG.md
   - Tag releases

2. **Release Notes**
   - Features added
   - Bugs fixed
   - Breaking changes
   - Migration guide

## Support

- GitHub Issues
- Discussion Forum
- Stack Overflow Tag
