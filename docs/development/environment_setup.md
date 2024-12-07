# Development Environment Setup

## Prerequisites

- Node.js (v20+)
- Bun (latest version)
- Docker Desktop
- VS Code
- Git

## VS Code Extensions

```json
{
  "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "bradlc.vscode-tailwindcss", "prisma.prisma", "graphql.vscode-graphql", "ms-playwright.playwright", "github.copilot", "github.vscode-github-actions", "mermaid-preview", "streetsidesoftware.code-spell-checker"]
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
  "tailwindCSS.experimental.classRegex": [["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]]
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

## Build Outputs and Generated Files

All build outputs and generated files are stored in the `artifacts` directory at the root of the project. This includes:

- Build artifacts (production and development builds)
- Test coverage reports
- Storybook static builds
- ESLint outputs
- Playwright test results
- TypeScript type checking outputs

### Managing Build Outputs

1. **Location**: All outputs are stored in `artifacts/<project-type>/<project-name>/<output-type>`

   - Example: `artifacts/apps/web/dist` for the web app's production build
   - Example: `artifacts/apps/web-e2e/playwright` for E2E test results

2. **Cleaning Up**:

   ```bash
   # Clean all outputs
   bun run cleanup

   # Clean and reinstall dependencies
   bun run cleanup --reinstall
   ```

3. **CI/CD Integration**:

   - Use `artifacts` directory for all artifact paths in CI/CD pipelines
   - Cache the `artifacts` directory between pipeline runs when appropriate
   - Clear the cache when dependencies change

4. **Development Best Practices**:
   - Never commit the `artifacts` directory to version control
   - Use the cleanup script before switching branches
   - Run cleanup with reinstall after major dependency updates

## Docker Services

```yaml
services:
  postgres:
    image: postgres:15
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: database

  redis:
    image: redis:7
    ports:
      - '6379:6379'
```

## Git Hooks

We use Husky for Git hooks:

- **pre-commit**: Runs linting and formatting
- **pre-push**: Runs tests and type checking
- **commit-msg**: Validates commit message format

## Troubleshooting

For common issues and solutions, see our [FAQ](faq.md).

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

1. Check the [FAQ](faq.md)
2. Search existing GitHub issues
3. Ask in the team chat
4. Create a new GitHub issue

## Next Steps

After setting up your environment:

1. Review the [FAQ](faq.md) for common questions and answers
