# Onboarding Guide

Welcome to the ACME project! This guide will help you get started with the development environment and understand our workflows.

## Prerequisites

Ensure you have the following installed:

- Node.js (v20 or later)
- Bun (v1.0 or later)
- Git
- VS Code (recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/acme.git
cd acme
```

### 2. Install Dependencies

```bash
# Install project dependencies
bun install

# Install recommended VS Code extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
code .env.local
```

Required environment variables:

- `OPENAI_API_KEY`: For AI-assisted development
- `DATABASE_URL`: Database connection string
- `AUTH_SECRET`: Authentication secret

### 4. Start Development Server

```bash
# Start the development server
bun dev

# Run tests
bun test

# Start Storybook
bun storybook
```

## Project Structure

```
acme/
├── apps/               # Application code
│   └── web/           # Next.js web application
├── packages/          # Shared packages
├── libs/             # Feature libraries
├── docs/             # Documentation
├── tools/            # Development tools
├── specs/            # Technical specifications
└── tmp/              # Temporary files
```

## Development Workflow

### 1. Feature Development

```bash
# Create a new feature branch
git checkout -b feat/ACME-123-your-feature-name

# Generate feature scaffold
bun run create:feature

# Start development server
bun dev
```

### 2. Component Development

```bash
# Generate new component
bun run create:component

# Start Storybook
bun storybook
```

### 3. Testing

```bash
# Run all tests
bun test

# Run specific tests
bun test path/to/test

# Run E2E tests
bun test:e2e
```

### 4. Code Quality

```bash
# Lint code
bun lint

# Format code
bun format

# Type check
bun typecheck
```

## Common Tasks

### Creating New Components

1. Run component generator:

```bash
bun run create:component
```

2. Follow the prompts:

   - Select component type
   - Enter component name
   - Choose features

3. Component will be created in appropriate directory

### Adding New Features

1. Run feature generator:

```bash
bun run create:feature
```

2. Follow the prompts:

   - Enter feature name
   - Provide description
   - Select options

3. Implement feature using generated scaffold

### Running Tests

```bash
# Unit tests
bun test

# Integration tests
bun test:integration

# E2E tests
bun test:e2e

# Coverage report
bun test:coverage
```

## Getting Help

### Documentation

1. Project documentation:

   - `/docs`: General documentation
   - `/specs`: Technical specifications
   - `/apps/*/docs`: Application-specific docs

2. Generated documentation:
   - Storybook: Component documentation
   - API documentation
   - Test coverage reports

### Tools and Resources

1. Development tools:

   - VS Code with recommended extensions
   - Chrome DevTools
   - React DevTools
   - Storybook

2. Monitoring tools:
   - Error tracking
   - Performance monitoring
   - Analytics

### Support Channels

1. Internal:

   - Team chat
   - Code reviews
   - Documentation

2. External:
   - GitHub issues
   - Stack Overflow
   - Community forums

## Best Practices

### Code Style

1. Follow TypeScript best practices:

   - Use proper types
   - Avoid `any`
   - Document complex types

2. Follow React best practices:

   - Functional components
   - Hooks for state
   - Proper prop types

3. Follow testing best practices:
   - Write tests first
   - Cover edge cases
   - Keep tests focused

### Git Workflow

1. Branch naming:

   - `feature/*`: New features
   - `fix/*`: Bug fixes
   - `docs/*`: Documentation
   - `refactor/*`: Code refactoring

2. Commit messages:

   - Clear and descriptive
   - Reference issues
   - Follow conventions

3. Pull requests:
   - Keep changes focused
   - Add tests
   - Update documentation

## Troubleshooting

### Common Issues

1. Build failures:

   - Check Node.js version
   - Clear cache: `bun clean`
   - Rebuild: `bun rebuild`

2. Test failures:

   - Check test environment
   - Update snapshots
   - Check dependencies

3. Development server issues:
   - Check port conflicts
   - Clear cache
   - Check logs

### Getting Unstuck

1. Check documentation:

   - Project docs
   - Tool docs
   - Error messages

2. Ask for help:

   - Team chat
   - Code reviews
   - Stack Overflow

3. Debug:
   - Use debugger
   - Add console logs
   - Check network

## Next Steps

1. Review documentation:

   - Architecture overview
   - Coding standards
   - Testing guide

2. Set up tools:

   - Configure editor
   - Install extensions
   - Set up debugging

3. Start contributing:
   - Pick starter task
   - Create branch
   - Submit PR

## Additional Resources

1. Learning materials:

   - TypeScript handbook
   - React documentation
   - Testing guides

2. Tool documentation:

   - Next.js docs
   - Tailwind docs
   - Storybook tutorials

3. Community resources:
   - Tech blogs
   - Video tutorials
   - Online courses
