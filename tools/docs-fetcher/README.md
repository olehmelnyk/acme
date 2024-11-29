# Documentation Fetcher

A generic documentation fetcher that can download and cache documentation from various third-party libraries and frameworks.

## Features

- Written in TypeScript with full type safety
- Uses native `fetch` for simple HTTP requests
- Uses Playwright for JavaScript-rendered content
- Project-specific caching with version tracking
- Automatic update detection based on version changes or cache age
- Configurable for different documentation sources
- Caches documentation locally for offline access
- Respects rate limiting with configurable delays

## Setup

1. Install dependencies:
```bash
bun install
```

2. Run the script with a specific documentation source:
```bash
bun start payload           # fetches Payload CMS docs
bun start nextjs           # fetches Next.js docs
bun start payload --force  # force update even if cache is fresh
```

If no source is specified, it defaults to 'payload'.

## Available Documentation Sources

- `payload`: Payload CMS documentation
- `nextjs`: Next.js documentation

## Cache Management

The script automatically manages documentation cache:
- Creates project-specific subfolders in the `cache` directory
- Tracks version information and last fetch date in `meta.json`
- Automatically checks for updates based on:
  - Cache age (older than 7 days)
  - Version changes (if version information is available)
- Provides force update option with `--force` flag

## Adding New Documentation Sources

Add new configurations to the `config.ts` file:

```typescript
export const configs: Record<string, DocsConfig> = {
  your_source: {
    baseUrl: 'https://your-docs-site.com',
    startPath: '/docs',
    selector: 'a[href^="/docs"]',
    urlFilter: (url: string) => url.startsWith('/docs'),
    projectName: 'your-project-name',
    versionSelector: '.version-element' // Optional
  }
};
```

## Configuration Options

- `baseUrl`: The base URL of the documentation site
- `startPath`: The starting path for documentation
- `selector`: CSS selector for finding documentation links
- `urlFilter`: Function to filter valid documentation URLs
- `projectName`: Name of the project (used for cache subfolder)
- `versionSelector`: CSS selector for version information (optional)
- `cacheDir`: Directory to store cached files (default: './cache')
- `delay`: Delay between requests in milliseconds (default: 500)

## Cache Structure

The cached files are organized by project:
```
cache/
├── payload/
│   ├── meta.json
│   ├── docs/index.html
│   └── docs/getting-started/what-is-payload.html
├── nextjs/
│   ├── meta.json
│   ├── docs/index.html
│   └── docs/getting-started/installation.html
```

## Notes

- Built with Bun for fast execution
- Uses TypeScript for better type safety and developer experience
- The script uses Playwright for better handling of modern JavaScript-based documentation sites
- Includes built-in rate limiting to avoid overwhelming documentation servers
- HTML content is saved as-is, including styles and scripts
- Cache directory is ignored by git to avoid committing large documentation files
