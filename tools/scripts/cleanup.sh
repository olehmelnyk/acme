#!/usr/bin/env bash

# Exit on error
set -e

# Print commands
set -x

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Cleaning up project...${NC}"

# Clean main output directory
if [ -d ".output" ]; then
    echo -e "${RED}Removing .output directory...${NC}"
    rm -rf .output
fi

# Clean Next.js cache
if [ -d ".next" ]; then
    echo -e "${RED}Removing .next directory...${NC}"
    rm -rf .next
fi

# Clean node_modules
if [ -d "node_modules" ]; then
    echo -e "${RED}Removing node_modules...${NC}"
    rm -rf node_modules
fi

# Clean Nx cache
if [ -d ".nx" ]; then
    echo -e "${RED}Removing Nx cache...${NC}"
    rm -rf .nx
fi

# Clean any stray output directories
find . -type d -name "dist" -exec rm -rf {} +
find . -type d -name "coverage" -exec rm -rf {} +
find . -type d -name ".next" -exec rm -rf {} +
find . -type d -name "storybook-static" -exec rm -rf {} +
find . -type d -name "html" -exec rm -rf {} +
find . -type d -name "out" -exec rm -rf {} +
find . -type d -name "tmp" -exec rm -rf {} +

# Clean package manager lock files
rm -f bun.lockb
rm -f yarn.lock
rm -f package-lock.json
rm -f pnpm-lock.yaml

echo -e "${GREEN}Cleanup complete!${NC}"

# Optional: Reinstall dependencies
if [ "$1" = "--reinstall" ]; then
    echo -e "${BLUE}Reinstalling dependencies...${NC}"
    bun install
    echo -e "${GREEN}Dependencies reinstalled!${NC}"
fi
