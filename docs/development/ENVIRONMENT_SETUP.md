# Development Environment Setup

## Prerequisites

- Node.js (v18+)
- Bun (latest version)
- Docker Desktop
- VS Code
- Git

## VS Code Extensions

```json
{
    "recommendations": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "prisma.prisma",
        "graphql.vscode-graphql",
        "ms-playwright.playwright",
        "github.copilot",
        "github.vscode-github-actions",
        "mermaid-preview",
        "streetsidesoftware.code-spell-checker"
    ]
}
```

## VS Code Settings

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "typescript.preferences.importModuleSpecifier": "shortest",
    "typescript.updateImportsOnFileMove.enabled": "always",
    "tailwindCSS.experimental.classRegex": [
        ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
    ]
}
```

## Initial Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Database Setup**
   ```bash
   docker-compose up -d
   bun run db:migrate
   bun run db:seed
   ```

5. **Start Development Server**
   ```bash
   bun dev
   ```

## Development Tools

### Package Manager (Bun)
- `bun install`: Install dependencies
- `bun add <package>`: Add new dependency
- `bun add -d <package>`: Add dev dependency
- `bun update`: Update dependencies

### Database Tools
- `bun run db:studio`: Open Prisma Studio
- `bun run db:migrate`: Run migrations
- `bun run db:seed`: Seed database
- `bun run db:reset`: Reset database

### Testing
- `bun test`: Run unit tests
- `bun test:e2e`: Run E2E tests
- `bun test:watch`: Run tests in watch mode
- `bun coverage`: Generate coverage report

### Code Quality
- `bun lint`: Run ESLint
- `bun format`: Run Prettier
- `bun typecheck`: Run TypeScript checks

### Storybook
- `bun storybook`: Start Storybook
- `bun build-storybook`: Build static Storybook

## Docker Services

```yaml
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: database

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

## Git Hooks

We use Husky for Git hooks:

- **pre-commit**: Runs linting and formatting
- **pre-push**: Runs tests and type checking
- **commit-msg**: Validates commit message format

## Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check if database is running
   docker ps
   # Reset database connection
   bun run db:reset
   ```

2. **Cache Issues**
   ```bash
   # Clear all caches
   bun run clean
   # Reinstall dependencies
   bun install
   ```

3. **Port Conflicts**
   ```bash
   # Check ports in use
   lsof -i :3000
   lsof -i :5432
   ```

### Getting Help

1. Check the [FAQ](./FAQ.md)
2. Search existing GitHub issues
3. Ask in the team chat
4. Create a new GitHub issue
