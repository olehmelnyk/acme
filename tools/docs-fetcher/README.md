# Documentation Fetcher

A tool for automatically fetching and caching documentation from various sources. Built with TypeScript and Bun.

## Features

- Automatically discovers packages in your project
- Fetches documentation from official sources
- Maintains documentation structure and order
- Supports multiple documentation formats and sources
- Configurable fetching behavior per package
- Offline access to documentation
- Smart URL discovery and validation
- Configurable rate limiting and retry logic
- Clean documentation updates (removes old files)

## Prerequisites

- [Bun](https://bun.sh) installed
- Node.js 18+ (for Playwright)

## Installation

```bash
# Install dependencies
bun install
```

## Usage

```bash
# Fetch documentation for a specific package
bun run fetch <package-name>

# Options:
#   --force        Force refresh even if already fetched
#   --limit=<n>    Limit the number of pages to fetch (default: 15)
```

## Configuration

The tool can be configured through `fetch-config.ts`:

```typescript
{
  // Root directory to scan for packages
  rootDir: string;
  
  // Patterns to scan for package.json files
  scanPaths: string[];
  
  // Paths to exclude from scanning
  excludePaths: string[];
  
  // Directory to store cached documentation
  cacheDir: string;
  
  // Maximum number of pages to fetch per package
  limit: number;
  
  // Maximum depth of links to follow
  maxDepth: number;
  
  // Delay between requests in milliseconds
  delay: number;
}
```

## Documentation Structure

Documentation is stored in a structured format:

```
cache/
  package-name/
    001-getting-started/
      001-introduction.html
      001-introduction.meta.json
      002-installation.html
      002-installation.meta.json
    002-features/
      001-routing.html
      001-routing.meta.json
```

Each HTML file has an accompanying metadata file containing:
- Original URL
- Fetch timestamp
- Title
- Category
- Path segments

## Project Structure

```
docs-fetcher/
├── index.ts           # Main entry point
├── config.ts          # Configuration handling
├── fetcher.ts         # Documentation fetching logic
├── utils.ts           # Utility functions
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
├── fetch-config.ts    # Fetch configuration
└── cache/             # Cached documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Development

```bash
# Run tests
bun test

# Build the project
bun run build

# Format code
bun run format
```

## License

MIT
