# Development FAQ

This document contains frequently asked questions and solutions for common development issues.

## Environment Setup

### Q: How do I resolve Node.js version conflicts?

A: We recommend using `nvm` (Node Version Manager) to manage Node.js versions:

```bash
nvm install 20
nvm use 20
```

### Q: How do I fix Bun installation issues?

A: Try the following:

1. Clear Bun cache: `rm -rf ~/.bun`
2. Reinstall Bun: `curl -fsSL https://bun.sh/install | bash`
3. Verify installation: `bun --version`

## Build Issues

### Q: Why is my build failing with dependency errors?

A: Try these steps:

1. Clear dependencies: `bun run clean:all`
2. Reinstall: `bun run install:all`
3. Rebuild: `bun run build`

### Q: How do I resolve TypeScript errors?

A: Common solutions:

1. Update TypeScript: `bun add -d typescript@latest`
2. Clear TypeScript cache: `rm -rf .tsbuildinfo`
3. Check `tsconfig.json` settings

## Testing

### Q: Why are my tests failing sporadically?

A: Common causes:

1. Race conditions in async tests
2. Global state pollution
3. Timezone-dependent tests
4. Network flakiness

Solutions:

1. Add proper test isolation
2. Mock external dependencies
3. Use stable test data

### Q: How do I debug tests?

A: Options:

1. Use `test.only` or `describe.only`
2. Add console.logs (remove before committing)
3. Use debugger with `--inspect` flag

## Performance

### Q: How do I improve build performance?

A: Try these:

1. Enable build caching
2. Use selective builds
3. Optimize dependencies

### Q: How do I profile performance issues?

A: Tools available:

1. Chrome DevTools
2. React Profiler
3. Lighthouse

## Related Documentation

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Testing Strategy](../architecture/TESTING.md)
- [Performance Guidelines](../architecture/diagrams/system/performance.md)
