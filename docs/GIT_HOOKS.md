# Git Hooks Documentation

## Overview

This document describes the Git hooks implemented in the ACME project to maintain code quality, security, and consistency across the development workflow.

## Prerequisites

- Node.js 20.x
- Bun 1.0.0+
- Git
- Optional tools:
  - Snyk (`npm install -g snyk`)
  - OSV Scanner (`go install github.com/google/osv-scanner/cmd/osv-scanner@latest`)
  - Gitleaks (`brew install gitleaks`)

## Hook Descriptions

### Pre-commit Hook

Runs before each commit to ensure code quality and security.

#### Checks:

1. **Branch Protection**

   - Prevents direct commits to protected branches
   - Protected branches: dev, stage, main

2. **Branch Naming Convention**

   - Pattern: `^(feat|fix|hotfix|release|support)/ACME-\d+-[a-zA-Z0-9/_-]+$`
   - Example: `feat/ACME-123-add-user-authentication`

3. **File Size**

   - Maximum file size: 10MB
   - Prevents committing large binary files

4. **Secret Detection**

   - Uses secretlint to scan staged files
   - Checks for API keys, tokens, and credentials

5. **Code Quality**
   - Runs lint-staged for code formatting
   - Performs TypeScript type checking
   - Runs tests for affected files
   - Ensures successful build

### Post-checkout Hook

Runs after checking out a branch to ensure environment consistency.

#### Features:

1. **Branch Status**

   - Shows commits ahead/behind main
   - Offers to pull latest changes
   - Warns about stale branches (>14 days old)

2. **Dependency Management**

   - Auto-installs dependencies on lock file changes
   - Checks for missing node_modules

3. **Environment Variables**

   - Detects changes in .env.example
   - Prompts for new environment variable setup

4. **Workspace Status**
   - Shows current branch info
   - Lists modified files
   - Suggests cleanup for untracked files

### Security Checks

Comprehensive security scanning integrated into the hooks.

#### Checks:

1. **Dependency Vulnerabilities**

   - npm audit (high/critical)
   - Snyk security scanning
   - OSV vulnerability database

2. **Code Analysis**

   - Environment variable exposure
   - Secrets in code (Gitleaks)
   - Next.js security headers

3. **Dependency Management**
   - Outdated package detection
   - Lock file integrity
   - Package version conflicts

## Configuration

### Branch Protection

Protected branches are configured in `.branchnaming`:

```javascript
{
  pattern: "^(feat|fix|hotfix|release|support)/ACME-\\d+-[a-zA-Z0-9/_-]+$",
  errorMsg: "Branch name must follow pattern: <type>/<ticket>-<description>",
  protected: ["dev", "stage", "main"]
}
```

### Security Tools

1. **Secretlint**: Configured in `.secretlintrc.json`
2. **Snyk**: Uses default configuration
3. **Gitleaks**: Uses default rules

## Best Practices

1. **Branch Management**

   - Create feature branches from latest main
   - Keep branches short-lived (<14 days)
   - Regularly sync with main

2. **Commits**

   - Write meaningful commit messages
   - Keep commits focused and atomic
   - Review staged changes before committing

3. **Security**
   - Never commit sensitive data
   - Use environment variables for secrets
   - Regularly update dependencies

## Troubleshooting

### Common Issues

1. **Hook Execution Permission**

   ```bash
   chmod +x .husky/*
   ```

2. **Node Modules Missing**

   ```bash
   bun install
   ```

3. **Security Tool Installation**
   ```bash
   npm install -g snyk
   brew install gitleaks
   ```

### Hook Bypass (Emergency Only)

```bash
git commit --no-verify
```

⚠️ Use with caution! This skips all pre-commit checks.

## Contributing

1. Review this documentation before making changes
2. Test hooks thoroughly in a feature branch
3. Update documentation when modifying hooks
4. Follow the existing code style and patterns
