# Cleanup Tool

A comprehensive cleanup utility for managing artifacts, dependencies, and temporary files in the monorepo.

## Features

- Clean up test artifacts (playwright-report, test-results, coverage)
- Remove build outputs (dist, .next, out)
- Delete temporary files and caches
- Remove old script directories
- Clean up node_modules and lock files
- Dry-run mode to preview changes
- Force mode to skip confirmation
- Install dependencies across all packages

## Installation

```bash
cd tools/cleanup
bun install
```

## Usage

From the root directory:

### Cleanup Commands

```bash
# Clean everything (with confirmation)
bun run clean:all

# Clean everything without confirmation
bun run clean:all -- --force

# Preview what would be cleaned (dry-run)
bun run clean:all -- --dry-run

# Clean specific items
bun run clean -- --artifacts    # Clean test and build artifacts
bun run clean -- --backups      # Clean backup files
bun run clean -- --old-scripts  # Clean old script directories
bun run clean -- --dependencies # Clean node_modules and lock files

# Combine options
bun run clean -- --artifacts --dependencies
```

### Installation Commands

```bash
# Install dependencies in all packages
bun run install:all
```

## What Gets Cleaned

### Test Artifacts

- `**/playwright-report/**`
- `**/test-results/**`
- `**/coverage/**`
- `**/html/**`

### Build Outputs

- `**/dist/**`
- `**/.next/**`
- `**/out/**`
- `**/storybook-static/**`

### Temporary Files

- `**/.nx/cache/**`
- `**/tmp/**`
- `**/logs/**`
- `**/*.log`

### Dependencies

- `**/node_modules/**`
- `**/bun.lockb`
- `**/*.bun`

## Implementation Details

The tool uses:

- TypeScript for type safety
- Commander.js for CLI interface
- Chalk for colored output
- Glob for file matching

## Security

- Confirmation required before deletion (unless using --force)
- Dry-run mode available to preview changes
- No sensitive file deletion
- Node modules are handled safely
