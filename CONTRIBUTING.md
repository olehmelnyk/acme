# Contributing Guidelines

## Getting Started

1. Fork the repository
2. Create a feature branch
3. Set up Git hooks
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 20.x
- Bun 1.0.0+
- Git
- Optional tools:
  - Snyk (`npm install -g snyk`)
  - OSV Scanner (`go install github.com/google/osv-scanner/cmd/osv-scanner@latest`)
  - Gitleaks (`brew install gitleaks`)

```bash
# Install dependencies
bun install

# Set up Git hooks
bun husky install

# Start development server
bun dev

# Run tests
bun test

# Run linting
bun lint
```

## Git Hooks

Our project uses Git hooks to maintain code quality and security. For detailed information, see our [Git Hooks Documentation](docs/git_hooks.md).

### Pre-commit Hook

Automatically runs before each commit to check:

- Branch naming convention
- Code formatting (Prettier)
- Linting (ESLint)
- Type checking (TypeScript)
- Unit tests
- Security vulnerabilities
- Large file detection
- Secret detection

### Post-checkout Hook

Automatically runs after checking out a branch to:

- Update dependencies if needed
- Check for environment variable changes
- Validate branch status
- Perform security checks

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

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
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

### Branch Naming Convention

All branches must follow this pattern:

```
<type>/ACME-<ticket>-<description>
```

Where:

- `type` is one of: feat, fix, hotfix, release, support
- `ticket` is the ticket number (e.g., ACME-123)
- `description` is a brief description using kebab-case

Examples:

- `feat/ACME-123-add-user-authentication`
- `fix/ACME-456-fix-login-validation`
- `hotfix/ACME-789-security-patch`

### Protected Branches

The following branches are protected and require pull requests:

- main
- dev
- stage

Direct commits to these branches are not allowed.

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
