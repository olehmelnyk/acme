# Documentation Fetcher

A specialized tool designed to download and store up-to-date documentation locally for AI agents. Since AI models cannot directly access online documentation and their training data may be outdated, this tool ensures they have access to the latest documentation by storing it in a local project directory.

## Purpose

- Download and store latest package documentation locally
- Make up-to-date documentation accessible to AI agents
- Enable offline documentation search and access
- Keep documentation current with periodic updates
- Bridge the gap between AI training data and current package versions

## Features

- 📥 Downloads complete documentation from official sources
- 🗂️ Organizes docs by package and version
- 🔍 Provides efficient search capabilities for AI agents
- 📚 Stores docs in `.gitignore`d directory for easy management
- 🔄 Supports periodic documentation updates
- 📋 Maintains metadata about downloaded documentation
- 🏷️ Version tracking for documentation updates
- 🔄 Force refresh documentation with `--force` or `-f` flag
- Pre-installation documentation fetching

## Installation

```bash
cd tools/docs-fetcher
bun install
```

## Usage

### Download Documentation

```bash
# Download docs for a specific package
bun run cli.ts react

# Download with page limit
bun run cli.ts express --limit=20

# Download docs for all packages
bun run cli.ts --all

# Force refresh (ignore cache)
bun run cli.ts --force react
bun run cli.ts -f --all

# Get installation instructions before installing
bun run cli.ts next --pre-install
```

### Pre-Installation Documentation

The `--pre-install` flag allows you to fetch installation instructions and documentation links before installing a package. This is useful when you want to:

- Check installation requirements
- View setup instructions
- Find documentation resources
- Verify package compatibility

Example:

```bash
bun run cli.ts next --pre-install
```

This will:

1. Fetch package information from npm
2. Find installation instructions from README or documentation
3. Display available documentation links
4. Show basic installation commands

### Search Documentation (for AI agents)

```bash
# Search in specific package docs
bun run cli.ts express --search="middleware"

# Search across all downloaded docs
bun run cli.ts --all --search="routing"
```

### Cache Management

```bash
# Clear search cache
bun run cli.ts --clear-cache

# View cache statistics
bun run cli.ts --cache-stats

# Force refresh with `--force` or `-f` flag
bun run cli.ts --force react
bun run cli.ts -f --all
```

## Directory Structure

```
.tools/docs-fetcher/
├── cache/                 # Documentation cache (gitignored)
│   ├── search-cache/     # Search index cache
│   └── [package-name]/   # Package-specific documentation
├── src/
│   ├── cli.ts           # Command line interface
│   ├── index.ts         # Main fetcher logic
│   ├── url-manager.ts   # URL handling and validation
│   ├── directory-manager.ts  # File system operations
│   ├── html-parser.ts   # HTML content parsing
│   ├── search.ts        # Search functionality
│   └── cache-manager.ts # Cache management
├── artifacts/              # Tool output directory (gitignored)
│   └── docs-fetcher/
│       ├── cache/        # Documentation cache
│       └── reports/      # Validation and analysis reports
└── package.json         # Dependencies and scripts
```

## For AI Agents

This tool is specifically designed for AI agents to:

1. Access current documentation that may not be in their training data
2. Search through documentation efficiently
3. Extract relevant information from latest package versions
4. Stay up-to-date with package changes and new features

### How AI Agents Should Use This Tool

1. **Documentation Access**:

   - Use search functionality to find relevant documentation
   - Access stored documentation files directly
   - Parse and analyze documentation content

2. **Version Awareness**:

   - Check documentation metadata for version information
   - Compare with known training data cutoff dates
   - Identify new features or changes

3. **Search Optimization**:
   - Use specific search queries for better results
   - Leverage cached search results for efficiency
   - Access related documentation sections

## Configuration

The tool can be configured through environment variables or command line arguments:

- `CACHE_DIR`: Directory for storing documentation (default: ./artifacts/docs-fetcher/cache)
- `MAX_PAGES`: Maximum pages to download per package
- `UPDATE_INTERVAL`: How often to check for doc updates
- `ALLOWED_DOMAINS`: List of allowed documentation domains

## Contributing

Feel free to contribute by:

1. Adding support for new documentation sources
2. Improving search algorithms
3. Enhancing metadata extraction
4. Optimizing storage and caching
5. Adding new features for AI agents

## License

MIT License
