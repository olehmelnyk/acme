#!/bin/bash

# Print what's being removed
echo "🧹 Cleaning up project..."

# Remove lock files
echo "Removing lock files..."
rm -f package-lock.json
rm -f bun.lockb
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Remove build and cache directories
echo "Removing build and cache directories..."
rm -rf dist
rm -rf .next
rm -rf node_modules
rm -rf .nx/cache
rm -rf tmp

# Remove Next.js specific directories
echo "Removing Next.js build cache..."
rm -rf apps/web/.next
rm -rf apps/web/node_modules

# Remove test coverage and cache
echo "Removing test coverage and cache..."
rm -rf coverage
rm -rf .vitest

echo "✨ Cleanup complete!"
